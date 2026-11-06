import assert from 'node:assert/strict'
import { GLOSSARY_CATEGORIES } from '../miniprogram/domain/glossary.ts'

export function validateGlossary(entries, texts, resolve, review) {
  assert.ok(Array.isArray(entries), '缺少字词资料')
  const ids = new Set(), usageIds = new Set(), records = []
  const required = (value, label) => assert.ok(typeof value === 'string' && value.trim(), `缺少字词 ${label}`)
  for (const entry of entries) {
    for (const key of ['id', 'term', 'pinyin', 'category', 'explanation', 'reviewId']) required(entry[key], key)
    assert.ok(entry.id.startsWith('glossary-') && !ids.has(entry.id), '字词 ID 重复或无效')
    ids.add(entry.id)
    assert.ok(GLOSSARY_CATEGORIES.some(category => category.id === entry.category), '字词类别无效')
    assert.ok(Array.isArray(entry.aliases) && new Set(entry.aliases).size === entry.aliases.length, '字词别名无效')
    entry.aliases.forEach(alias => required(alias, '别名'))
    const example = texts.get(entry.example?.blockId)
    required(entry.example?.quote, '例句')
    assert.ok(example?.original.includes(entry.example.quote), '字词例句与正文不符')
    assert.ok(Array.isArray(entry.usages) && entry.usages.length, '字词缺少随文用法')
    const passages = new Map()
    passages.set(example.id, example.original)
    for (const usage of entry.usages) {
      for (const key of ['id', 'term', 'pinyin', 'explanation']) required(usage[key], key)
      assert.ok(usage.id.startsWith(`${entry.id}-`) && !usageIds.has(usage.id), '字词用法 ID 重复或无效')
      usageIds.add(usage.id)
      resolve(usage.refs)
      assert.ok(Array.isArray(usage.occurrences) && usage.occurrences.length, '字词用法缺少关联段落')
      const linked = new Set()
      for (const occurrence of usage.occurrences) {
        const block = texts.get(occurrence.blockId)
        required(occurrence.quote, '原词片段')
        assert.ok(block?.original.includes(occurrence.quote), `字词关联与正文不符 ${occurrence.blockId}`)
        const key = `${occurrence.blockId}:${occurrence.quote}`
        assert.ok(!linked.has(key), '字词关联重复')
        linked.add(key)
        passages.set(block.id, block.original)
      }
    }
    const { reviewId, ...subject } = entry
    const record = review(reviewId, entry.id, { entry: subject, passages: Object.fromEntries(passages) },
      [...entry.refs, ...entry.usages.flatMap(usage => usage.refs)])
    assert.notEqual(record.originalStatus, 'not-applicable', '字词电子核对不可不适用')
    assert.notEqual(record.explanationStatus, 'not-applicable', '字词释义审核不可不适用')
    assert.ok(['pending', 'passed', 'needs-fix'].includes(record.independentReviewStatus), '缺少字词独立复审状态')
    records.push(record)
  }
  return records
}

export function glossaryLinks(entries, texts) {
  const links = new Map()
  for (const entry of entries) for (const usage of entry.usages) for (const occurrence of usage.occurrences) {
    if (!links.has(occurrence.blockId)) links.set(occurrence.blockId, [])
    const list = links.get(occurrence.blockId)
    if (!list.some(item => item.id === usage.id)) list.push({ id: usage.id, index: texts.get(occurrence.blockId).original.indexOf(occurrence.quote) })
  }
  return new Map([...links].map(([id, list]) => [id, list.sort((a, b) => a.index - b.index).map(item => item.id)]))
}
