import test from 'node:test'
import assert from 'node:assert/strict'
import { newFlow, readSession, startSession } from '../miniprogram/state/session'
import { endReading, readReading, startReading } from '../miniprogram/state/reading'
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
  detail.observe()
  const observationQuery = query(navigations.at(-1)!)
  assert.equal(new URL(navigations.at(-1)!, 'https://local').pathname, '/pages/changes/index')
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
  assert.equal(navigations.length, 1)
  const entry = query(navigations[0])
  assert.equal(entry.id, '12')
  const context = readReading(entry.reading, 12)!
  assert.equal(context.filtered, true)
  const samples = atlas.data.samples
  assert.deepEqual(context.ids, samples.map((item: { id: number }) => item.id))
  assert.equal(atlas.data.busy, true)
  atlas.read(tap(1))
  assert.equal(navigations.length, 1)
  atlas.onHide()
  atlas.onShow()
  assert.equal(atlas.data.busy, false)
  assert.deepEqual([atlas.keyword, atlas.data.upperIndex, atlas.data.lowerIndex], ['天', 1, 0])
  assert.equal(atlas.data.samples, samples)
  assert.deepEqual(scrolls, [{ scrollTop: 320, duration: 0 }])
  endReading(context)
})

test('查阅结果复制快照，导航失败释放对应上下文', async t => {
  await loaded
  const ids = [1, 6, 10]
  const first = startReading(ids, true)
  ids.push(12)
  assert.deepEqual(first.ids, [1, 6, 10])
  endReading(first)

  let attempt: { url: string; fail: () => void } | undefined
  Object.assign(globalThis, { wx: { navigateTo: (options: typeof attempt) => { attempt = options } } })
  const atlas = page('atlas')
  t.after(() => atlas.onUnload())
  atlas.read({ currentTarget: { dataset: { id: 1 } } })
  const entry = query(attempt!.url)
  assert.equal(readReading(entry.reading, 1)!.filtered, false)
  assert.equal(atlas.data.busy, true)
  attempt!.fail()
  assert.equal(atlas.data.busy, false)
  assert.equal(readReading(entry.reading, 1), undefined)
})

test('直接与筛选查阅同页翻阅，边界禁用且换卦只结束本页观变', async () => {
  await loaded
  const navigations: string[] = [], titles: string[] = [], scrolls: unknown[] = []
  Object.assign(globalThis, {
    getCurrentPages: () => [{ route: 'pages/atlas/index' }, { route: 'pages/detail/index' }],
    wx: {
      navigateTo: ({ url }: { url: string }) => navigations.push(url),
      setNavigationBarTitle: ({ title }: { title: string }) => titles.push(title),
      pageScrollTo: ({ complete, ...options }: { complete?: () => void; scrollTop: number; duration: number }) => { scrolls.push(options); complete?.() },
    },
  })
  const move = (direction: number) => ({ currentTarget: { dataset: { direction } } })
  const direct = page('detail')
  direct.onLoad({ id: '1' })
  assert.equal(direct.data.filtered, false)
  assert.equal(direct.data.previous, null)
  assert.equal(direct.data.next.id, 2)
  direct.switchHexagram(move(-1))
  assert.equal(direct.data.id, 1)
  assert.equal(scrolls.length, 0)
  direct.switchHexagram(move(1))
  direct.switchHexagram(move(1))
  assert.equal(direct.data.id, 3)
  assert.equal(titles.at(-1), '水雷屯')
  assert.equal(navigations.length, 0)
  assert.deepEqual(scrolls, [{ scrollTop: 0, duration: 0 }, { scrollTop: 0, duration: 0 }])
  direct.onUnload()
  const last = page('detail')
  last.onLoad({ id: '64' })
  assert.equal(last.data.previous.id, 63)
  assert.equal(last.data.next, null)
  last.switchHexagram(move(1))
  assert.equal(last.data.id, 64)
  last.onUnload()

  const single = startReading([12], true)
  const only = page('detail')
  only.onLoad({ id: '12', reading: single.key })
  assert.deepEqual([only.data.filtered, only.data.previous, only.data.next], [true, null, null])
  only.switchHexagram(move(-1))
  only.switchHexagram(move(1))
  assert.equal(only.data.id, 12)
  only.onUnload()
  assert.equal(readReading(single.key, 12), undefined)

  const context = startReading([1, 6, 10], true)
  const detail = page('detail')
  detail.onLoad({ id: '6', reading: context.key })
  assert.deepEqual([detail.data.previous.id, detail.data.next.id], [1, 10])
  detail.observe()
  const firstQuery = query(navigations.at(-1)!)
  const first = readSession(firstQuery)!
  assert.equal(first.mode, 'atlas')
  if (first.mode === 'atlas') first.selected = [2, 5]
  detail.onShow()
  detail.switchHexagram(move(1))
  assert.deepEqual([detail.data.id, detail.data.previous.id, detail.data.next, detail.data.directoryOpen], [10, 6, null, false])
  assert.equal(readSession(firstQuery), undefined)
  assert.equal(navigations.length, 1)
  detail.observe()
  const secondQuery = query(navigations.at(-1)!)
  assert.deepEqual(readSession(secondQuery), { mode: 'atlas', hexagramId: 10, selected: [] })
  const replacement: CastSession = { mode: 'manual', hexagramId: 43, selected: [3] }
  const replacementQuery = query(startSession(replacement))
  detail.onShow()
  detail.switchHexagram(move(-1))
  assert.equal(detail.data.id, 6)
  assert.equal(readSession(replacementQuery), replacement)
  assert.equal(readReading(context.key, 6), context)
  detail.onUnload()
  assert.equal(readSession(replacementQuery), replacement)
  assert.equal(readReading(context.key, 6), undefined)
})

test('明确传入的失效或不匹配查阅上下文提示错误，不扩大阅读范围', async () => {
  await loaded
  Object.assign(globalThis, {
    getCurrentPages: () => [{ route: 'pages/detail/index' }],
    wx: { setNavigationBarTitle() {}, navigateTo() { assert.fail('失效详情不应进入观变') } },
  })
  const old = startReading([1], true)
  const current = startReading([2], true)
  for (const entry of [
    { id: '1', reading: '' }, { id: '1', reading: 'missing' },
    { id: '1', reading: old.key }, { id: '1', reading: current.key },
  ]) {
    const detail = page('detail')
    detail.onLoad(entry)
    detail.observe()
    assert.equal(detail.data.valid, false)
    assert.equal(detail.data.error, '本次查阅已失效，请返回图鉴')
    detail.onUnload()
    assert.equal(readReading(current.key, 2), current)
  }
  const detail = page('detail')
  detail.onLoad({ id: '2', reading: current.key })
  assert.equal(detail.data.valid, true)
  const replacement = startReading([6], true)
  detail.onShow()
  assert.equal(detail.data.valid, false)
  assert.equal(detail.data.error, '本次查阅已失效，请返回图鉴')
  detail.observe()
  detail.onUnload()
  assert.equal(readReading(replacement.key, 6), replacement)
  const direct = page('detail')
  direct.onLoad({ id: '64' })
  assert.equal(direct.data.valid, true)
  direct.onUnload()
  assert.equal(readReading(replacement.key, 6), replacement)
  endReading(replacement)
})

test('目录关闭完成后展开并按实测位置定位，关闭和返回不重复旧目标', async () => {
  await loaded
  const revealed: string[] = [], scrolls: unknown[] = []
  Object.assign(globalThis, {
    getCurrentPages: () => [{ route: 'pages/detail/index' }],
    wx: {
      setNavigationBarTitle() {},
      navigateTo() { assert.fail('目录打开或关闭中不应开始观变') },
      pageScrollTo: (options: unknown) => scrolls.push(options),
    },
  })
  const detail = page('detail')
  detail.onLoad({ id: '1' })
  detail.selectComponent = (selector: string) => {
    assert.equal(selector, '#reading')
    return { reveal: (target: string, done: (top: number) => void) => { revealed.push(target); done(180) } }
  }
  detail.createSelectorQuery = () => ({
    select(selector: string) { assert.equal(selector, '#directory-bar'); return this },
    boundingClientRect() { return this }, selectViewport() { return this }, scrollOffset() { return this },
    exec(done: (rects: unknown[]) => void) { done([{ height: 52 }, { scrollTop: 220 }]) },
  })
  detail.openDirectory()
  assert.equal(detail.data.directoryOpen, true)
  detail.observe()
  detail.chooseSection({ currentTarget: { dataset: { section: 'yao-5' } } })
  assert.deepEqual([detail.data.directoryOpen, detail.data.directoryClosing, revealed.length], [false, true, 0])
  detail.openDirectory()
  detail.observe()
  detail.switchHexagram({ currentTarget: { dataset: { direction: 1 } } })
  assert.deepEqual([detail.data.directoryOpen, detail.data.id], [false, 1])
  detail.directoryLeaving()
  detail.directoryLeft()
  assert.deepEqual(revealed, ['yao-5'])
  assert.deepEqual(scrolls, [{ scrollTop: 348, duration: 0 }])
  assert.equal(detail.data.directoryClosing, false)
  detail.directoryLeft()
  detail.openDirectory()
  detail.closeDirectory()
  detail.directoryLeaving()
  detail.directoryLeft()
  detail.openDirectory()
  detail.directoryLeaving()
  detail.directoryLeft()
  assert.deepEqual(revealed, ['yao-5'])
  assert.equal(scrolls.length, 1)
  detail.onUnload()
})
