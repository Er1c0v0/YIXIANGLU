import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { searchHexagrams } from '../miniprogram/domain/search'
import { SEARCH_ENTRIES } from '../miniprogram/data/search'
import { IMAGERY, ELEMENT_RELATIONS } from '../miniprogram/data/trigrams'
import { BASELINE, TRIGRAM_BASELINE } from './fixtures/hexagrams'
import type { TrigramId } from '../miniprogram/domain/types'
import { readContent, validateContent } from '../scripts/content-lib.mjs'

const dataset = readContent()

test('全部登记检索词、规范化、同音、无结果及数字精确卦序', () => {
  for (const e of SEARCH_ENTRIES) {
    const terms = [e.name, e.fullName, ...e.traditionalNames, ...e.aliases.map(a => a.value), e.pinyin, e.fullNamePinyin, ...e.pinyinInitials]
    for (const term of terms) assert.ok(searchHexagrams(SEARCH_ENTRIES, term).includes(e.id), `${e.id}: ${term}`)
  }
  for (const query of ['1','01','11','64','65','0']) assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, query), Number(query) >= 1 && Number(query) <= 64 ? [Number(query)] : [])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, 'Q I Á N'), [1,15])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, ' 風天小畜 '), [9])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, 'Fēng Tiān Xiǎo Xù'), [9])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, 'FTXX'), [9])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, '遯'), [33])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, '不存在的卦'), [])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, '1a'), [])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, '9'.repeat(1000)), [])
  assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, '　０１ '), [1])
  for (const query of ['LǙ','lü','lv','lu:']) assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, query), [10,56])
  assert.deepEqual(searchHexagrams([...SEARCH_ENTRIES].reverse(), ''), Array.from({length:64}, (_,i) => i+1))
})

test('81种上下卦组合与关键词交集以独立六爻基准核对方向', () => {
  const options = [undefined, ...Object.keys(TRIGRAM_BASELINE) as TrigramId[]]
  const queries = ['qian','小','風','FTXX','01','11','64','65','不存在'].map(query => [query, searchHexagrams(SEARCH_ENTRIES, query)] as const)
  for (const upper of options) for (const lower of options) {
    const expected = BASELINE.flatMap((lines,i) => (!upper || lines.slice(3) === TRIGRAM_BASELINE[upper]) && (!lower || lines.slice(0,3) === TRIGRAM_BASELINE[lower]) ? [i+1] : [])
    assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, '', upper, lower), expected)
    for (const [query, matches] of queries) {
      assert.deepEqual(searchHexagrams(SEARCH_ENTRIES, query, upper, lower), expected.filter(id => matches.includes(id)))
    }
  }
})

test('课堂转录、生克与检索速查构建拒绝规则', () => {
  const order: TrigramId[] = ['qian','kun','zhen','xun','kan','li','gen','dui']
  const rows = readFileSync('docs/PRD.md','utf8').split('\n').filter(line => /^\| (自然|卦性|人伦|动物|身体|后天方位|八门|季节（课堂表）) \|/.test(line))
  const categories = ['nature','quality','family','animal','body','later-direction','gate','season']
  assert.equal(rows.length, categories.length)
  rows.forEach((row,i) => {
    const cells = row.split('|').slice(2,-1).map(cell => cell.trim())
    assert.equal(cells.length, order.length)
    order.forEach((t,j) => {
      const entries = IMAGERY.filter(e => e.trigram === t && e.category === categories[i] && e.refs.some(ref => ref.sourceId === 'prd-classroom'))
      assert.equal(entries.length, 1)
      assert.deepEqual(entries[0].values, [cells[j]])
    })
  })
  const cycles = { generates: ['wood','fire','earth','metal','water'], controls: ['wood','earth','water','fire','metal'] }
  for (const relation of ['generates','controls'] as const) {
    const expected = cycles[relation].map((from,i,a) => `${from}:${a[(i+1)%5]}`).sort()
    assert.deepEqual(ELEMENT_RELATIONS.filter(e => e.relation === relation).map(e => `${e.from}:${e.to}`).sort(), expected)
  }
  const cases = [
    [(d: typeof dataset) => d.search[0].upper = 'kun', /检索元数据不符/],
    [(d: typeof dataset) => d.search[0].pinyinInitials = ['x'], /拼音首字母不符/],
    [(d: typeof dataset) => d.search[0].aliases = [{value:'虚构别名',refs:[]}], /缺少来源引用/],
    [(d: typeof dataset) => d.search[0].traditionalNames[0] += '改', /审核已过期/],
    [(d: typeof dataset) => d.imagery.splice(d.imagery.findIndex(e => e.category === 'season'),1), /意象缺项/],
    [(d: typeof dataset) => d.imagery[0].trigram = 'missing', /意象卦归属无效/],
    [(d: typeof dataset) => d.imagery.find(e => e.category === 'gate').tradition = 'classroom', /八门须标注/],
    [(d: typeof dataset) => d.relations[0].to = d.relations[0].from, /生克端点无效/],
    [(d: typeof dataset) => d.relations.pop(), /相生相克各须5条/],
    [(d: typeof dataset) => d.reviews.find(r => r.id === d.search[0].reviewId).independentReviewStatus = undefined, /缺少资料独立复审/],
  ] as const
  for (const [change, message] of cases) { const copy = structuredClone(dataset); change(copy); assert.throws(() => validateContent(copy), message) }
})
