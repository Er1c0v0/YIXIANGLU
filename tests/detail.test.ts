import test from 'node:test'
import assert from 'node:assert/strict'
import { newFlow, readSession, startSession } from '../miniprogram/state/session'
import type { CastSession } from '../miniprogram/domain/types'

// 只模拟页面逻辑所需的同步 data 更新，不模拟渲染或原生页面栈。
const definitions: Record<string, any> = {}
let loading = ''
Object.assign(globalThis, { Page: (definition: any) => { definitions[loading] = definition } })
const loaded = (async () => {
  for (const name of ['detail', 'atlas', 'hexagram', 'changes']) {
    loading = name
    await import(`../miniprogram/pages/${name}/index.ts`)
  }
})()
const page = (name: string) => ({
  ...definitions[name], data: structuredClone(definitions[name].data),
  setData(patch: Record<string, unknown>, done?: () => void) { Object.assign(this.data, patch); done?.() },
})
const query = (url: string) => Object.fromEntries(new URL(url, 'https://local').searchParams)

test('独立查阅、直接观察、返回续选及会话替代与卸载归属', async () => {
  await loaded
  const navigations: string[] = [], titles: string[] = [], tabs: string[] = []
  let stack = [{ route: 'pages/detail/index' }]
  Object.assign(globalThis, {
    getCurrentPages: () => stack,
    wx: {
      navigateTo: ({ url }: { url: string }) => navigations.push(url),
      setNavigationBarTitle: ({ title }: { title: string }) => titles.push(title),
      switchTab: ({ url }: { url: string }) => tabs.push(url),
    },
  })
  newFlow()
  const original: CastSession = { mode: 'manual', hexagramId: 11, selected: [2, 5] }
  const originalQuery = query(startSession(original))
  const oldResult = page('hexagram')
  oldResult.onLoad(originalQuery)
  oldResult.onShow()
  assert.equal(oldResult.data.valid, true)

  const direct = page('detail')
  direct.onLoad({ id: '64' })
  assert.deepEqual([direct.data.valid, direct.data.id, direct.data.showAtlasLink], [true, 64, true])
  assert.equal(titles.at(-1), '火水未济')
  direct.atlas()
  assert.deepEqual(tabs, ['/pages/atlas/index'])
  direct.onUnload()
  assert.equal(readSession(originalQuery), original)
  for (const id of [undefined, '0', '65', '1abc']) {
    const invalid = page('detail')
    invalid.onLoad(id === undefined ? {} : { id })
    invalid.observe()
    assert.deepEqual([invalid.data.valid, invalid.data.id, invalid.data.showAtlasLink], [false, 0, true])
  }
  assert.equal(navigations.length, 0)

  stack = [{ route: 'pages/atlas/index' }, { route: 'pages/detail/index' }]
  const detail = page('detail')
  detail.onLoad({ id: '1' })
  detail.onShow()
  assert.equal(detail.data.showAtlasLink, false)
  assert.equal(titles.at(-1), '乾为天')
  assert.equal(readSession(originalQuery), original)
  detail.observe()
  const observationQuery = query(navigations.at(-1)!)
  assert.equal(new URL(navigations.at(-1)!, 'https://local').pathname, '/pages/changes/index')
  assert.equal(observationQuery.id, '1')
  assert.equal(observationQuery.mode, 'atlas')
  const observation = readSession(observationQuery)!
  assert.deepEqual(observation, { mode: 'atlas', hexagramId: 1, selected: [] })
  detail.observe()
  assert.equal(navigations.length, 1)

  const changes = page('changes')
  changes.onLoad(observationQuery)
  changes.onShow()
  changes.choose({ detail: { position: 2 } })
  changes.choose({ detail: { position: 5 } })
  detail.onShow()
  assert.equal(detail.data.busy, false)
  detail.observe()
  assert.equal(readSession(query(navigations.at(-1)!)), observation)
  assert.deepEqual(changes.data.selected, [2, 5])

  const replacement: CastSession = { mode: 'number', hexagramId: 43, fixed: 3 }
  startSession(replacement)
  const before = navigations.length
  oldResult.onShow()
  oldResult.next()
  changes.onShow()
  changes.choose({ detail: { position: 1 } })
  changes.clear()
  changes.confirm()
  assert.equal(oldResult.data.valid, false)
  assert.equal(changes.data.valid, false)
  assert.deepEqual(changes.data.selected, [2, 5])
  assert.equal(navigations.length, before)
  detail.onShow()
  detail.observe()
  const restarted = readSession(query(navigations.at(-1)!))!
  assert.notEqual(restarted, observation)
  assert.deepEqual(restarted, { mode: 'atlas', hexagramId: 1, selected: [] })

  const replacementQuery = query(startSession(replacement))
  detail.onUnload()
  assert.equal(readSession(replacementQuery), replacement)
  const fresh = page('detail')
  fresh.onLoad({ id: '2' })
  fresh.observe()
  const freshQuery = query(navigations.at(-1)!)
  fresh.onUnload()
  assert.equal(readSession(freshQuery), undefined)
})

test('图鉴点击先完成待执行搜索，返回保留列表条件并恢复滚动调用', async t => {
  await loaded
  const navigations: string[] = [], scrolls: unknown[] = []
  Object.assign(globalThis, { wx: {
    navigateTo: ({ url }: { url: string }) => navigations.push(url),
    pageScrollTo: (options: unknown) => scrolls.push(options),
  } })
  const atlas = page('atlas')
  t.after(() => atlas.onUnload())
  const tap = (id: number) => ({ currentTarget: { dataset: { id } } })
  const upperQian = { detail: { value: '1' }, currentTarget: { dataset: { side: 'upper' } } }
  atlas.filter(upperQian)
  atlas.input({ detail: { value: '12' } })
  atlas.read(tap(1))
  assert.equal(atlas.timer, 0)
  assert.deepEqual(atlas.data.samples.map((item: { id: number }) => item.id), [12])
  assert.equal(atlas.data.busy, false)
  assert.equal(navigations.length, 0)

  atlas.reset()
  atlas.filter(upperQian)
  atlas.onPageScroll({ scrollTop: 320 })
  atlas.input({ detail: { value: '天' } })
  atlas.read(tap(12))
  assert.equal(atlas.timer, 0)
  assert.deepEqual(navigations, ['/pages/detail/index?id=12'])
  const samples = atlas.data.samples
  assert.equal(samples.length, 8)
  assert.equal(atlas.data.busy, true)
  atlas.read(tap(1))
  assert.equal(navigations.length, 1)
  atlas.onHide()
  atlas.onShow()
  assert.equal(atlas.data.busy, false)
  assert.deepEqual([atlas.keyword, atlas.data.upperIndex, atlas.data.lowerIndex], ['天', 1, 0])
  assert.equal(atlas.data.samples, samples)
  assert.deepEqual(scrolls, [{ scrollTop: 320, duration: 0 }])
})
