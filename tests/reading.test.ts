import test from 'node:test'
import assert from 'node:assert/strict'
import { getContent } from '../miniprogram/data/repository'

// 仅模拟组件方法需要的 data 更新和单层数组路径，不模拟 WXML 渲染。
const definitions: Record<string, any> = {}
let loading = ''
Object.assign(globalThis, { Component: (definition: any) => { definitions[loading] = definition } })
const loaded = (async () => {
  for (const name of ['reading', 'source-panel']) {
    loading = name
    await import(`../miniprogram/components/${name}/index.ts`)
  }
})()
const component = (name: string) => ({
  ...definitions[name].methods, data: structuredClone(definitions[name].data),
  setData(patch: Record<string, unknown>) {
    for (const [key, value] of Object.entries(patch)) {
      const entry = /^(\w+)\[(\d+)\]$/.exec(key)
      if (entry) this.data[entry[1]][Number(entry[2])] = value
      else this.data[key] = value
    }
  },
})

test('六爻独立开合，目录仅展开目标并在渲染后测量，换卦恢复初始状态', async () => {
  await loaded
  const reading = component('reading')
  const observe = (id: number) => definitions.reading.observers.hexagramId.call(reading, id)
  const tap = (index: number) => reading.toggleYao({ currentTarget: { dataset: { index } } })
  observe(1)
  assert.deepEqual(reading.data.yaoOpen, [false, false, false, false, false, false])
  tap(0)
  tap(4)
  tap(5)
  assert.deepEqual(reading.data.yaoOpen, [true, false, false, false, true, true])
  tap(4)
  assert.deepEqual(reading.data.yaoOpen, [true, false, false, false, false, true])
  reading.toggleStatement()
  reading.toggleOverview()
  reading.toggleTuan()
  reading.toggleImage()
  reading.toggleSpecial()

  const content = reading.data.content
  const update = reading.setData
  let rendered: (() => void) | undefined, measure: ((rect: { top: number }) => void) | undefined
  const selectors: string[] = []
  reading.setData = (patch: Record<string, unknown>, done?: () => void) => {
    update.call(reading, patch)
    rendered = done
  }
  reading.createSelectorQuery = () => ({
    select(selector: string) { selectors.push(selector); return this },
    boundingClientRect(done: (rect: { top: number }) => void) { measure = done; return this },
    exec() { measure!({ top: 123 }) },
  })
  const reveal = (target: string) => {
    const count = selectors.length
    let top: number | undefined
    reading.reveal(target, (value: number) => { top = value })
    assert.equal(selectors.length, count)
    assert.equal(top, undefined)
    assert.ok(rendered)
    rendered()
    assert.equal(selectors.at(-1), `#section-${target}`)
    assert.equal(top, 123)
    assert.equal(reading.data.content, content)
  }
  reveal('yao-5')
  const expanded = { ...reading.data, yaoOpen: [...reading.data.yaoOpen] }
  assert.deepEqual(expanded.yaoOpen, [true, false, false, false, true, true])
  reveal('yao-5')
  assert.deepEqual(reading.data, expanded)
  reveal('yao')
  assert.deepEqual(reading.data, expanded)
  reveal('statement')
  assert.deepEqual(reading.data, { ...expanded, statementOpen: true })
  reading.setData = update

  observe(2)
  assert.equal(reading.data.meta.id, 2)
  assert.equal(reading.data.content, getContent(2))
  assert.deepEqual(reading.data.yaoOpen, [false, false, false, false, false, false])
  assert.deepEqual([
    reading.data.statementOpen, reading.data.overviewOpen, reading.data.tuanOpen,
    reading.data.imageOpen, reading.data.specialOpen,
  ], [true, true, false, false, false])
})

test('共同来源保留爻辞及小象各自定位，更换引用关闭已展开面板', async () => {
  await loaded
  const panel = component('source-panel')
  const observe = (id: number) => {
    const yao = getContent(id)!.yao[4]
    definitions['source-panel'].observers['refs, relatedRefs'].call(panel, yao.text.originalRefs, yao.smallImage.originalRefs)
    assert.deepEqual(panel.data.sources.map((source: { locator: string }) => source.locator),
      [...yao.text.originalRefs, ...yao.smallImage.originalRefs].map(ref => ref.locator))
  }
  observe(1)
  assert.equal(panel.data.open, false)
  panel.toggle()
  assert.equal(panel.data.open, true)
  observe(2)
  assert.equal(panel.data.open, false)
})
