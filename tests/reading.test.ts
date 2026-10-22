import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
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

test('六爻默认折叠、各自开合，换卦恢复章节和六爻初始状态', async () => {
  await loaded
  const reading = component('reading')
  const observe = (id: number) => definitions.reading.observers.hexagramId.call(reading, id)
  const tap = (index: number) => reading.toggleYao({ currentTarget: { dataset: { index } } })
  assert.equal(definitions.reading.properties.showYao.value, false)
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

test('完整六爻仅详情启用，阅读及分析原文使用可选取的原生 text', () => {
  const pages = new URL('../miniprogram/pages/', import.meta.url)
  const enabled = readdirSync(pages).filter(name =>
    /<reading\b[^>]*\bshow-yao="\{\{true\}\}"/.test(readFileSync(new URL(`${name}/index.wxml`, pages), 'utf8')))
  assert.deepEqual(enabled, ['detail'])
  for (const path of ['components/reading', 'pages/analysis']) {
    const template = readFileSync(new URL(`../miniprogram/${path}/index.wxml`, import.meta.url), 'utf8')
    const originals = [...template.matchAll(/<(\w+)\b[^>]*\bclass="[^"]*\boriginal\b[^"]*"[^>]*>/g)]
    assert.ok(originals.length > 0)
    for (const [tag, name] of originals) {
      assert.equal(name, 'text', path)
      assert.match(tag, /\buser-select="\{\{true\}\}"/, path)
    }
  }
})
