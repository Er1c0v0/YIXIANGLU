import test from 'node:test'
import assert from 'node:assert/strict'
import { readContent, readReviewFiles, expandReviews, hash, validateContent } from '../scripts/content-lib.mjs'
import { getContent } from '../miniprogram/data/repository'
import { HEXAGRAM_CONTENT } from '../miniprogram/data/content'

const dataset = readContent()

test('构建拒绝坏引用与过期数据，发布拒绝缺卦和未电子核对原文', () => {
  const reviewFile = readReviewFiles()
  const invalidMethod = structuredClone(reviewFile)
  invalidMethod.records[0].method = 'missing'
  assert.throws(() => expandReviews(invalidMethod), /核对流程悬空/)
  const invalidStatus = structuredClone(reviewFile)
  invalidStatus.methods[invalidStatus.records[0].method].originalStatus = 'passed'
  assert.throws(() => expandReviews(invalidStatus), /核对流程只允许/)
  const cases = [
    [(d:typeof dataset)=>d.contents.push(structuredClone(d.contents[0])),/卦 ID 重复/],
    [(d:typeof dataset)=>d.contents[0].statement.original='',/缺少 original/],
    [(d:typeof dataset)=>d.contents[0].statement.originalRefs[0].sourceId='missing',/来源悬空/],
    [(d:typeof dataset)=>d.contents[0].statement.reviewId='missing',/缺少审核/],
    [(d:typeof dataset)=>d.contents[0].yao.reverse(),/六爻必须从下到上/],
    [(d:typeof dataset)=>d.contents[0].statement.original+='改',/审核已过期/],
  ] as const
  for (const [change,message] of cases) { const copy=structuredClone(dataset); change(copy); assert.throws(()=>validateContent(copy),message) }
  const first = dataset.contents[0]
  const partial = { ...dataset, search: [], imagery: [], relations: [], contents: [first], reviews: dataset.reviews.filter(record => record.subjectId.startsWith(`h${first.id}-`)) }
  assert.throws(() => validateContent(partial, { release: true }), /64 卦/)
  const unreviewed = structuredClone(dataset)
  unreviewed.reviews.find(record => record.id === first.statement.reviewId).originalStatus = 'pending'
  assert.throws(() => validateContent(unreviewed, { release: true }), /发布原文电子核对未完成/)
})

test('已复现字形问题回归', () => {
  for (const content of HEXAGRAM_CONTENT) {
    const blocks = [content.statement, content.tuan, content.greatImage, ...content.yao.flatMap(yao => [yao.text, yao.smallImage]), ...content.specialEntries.flatMap(entry => [entry.text, entry.smallImage])]
    // 这些录文字形已在模拟器中复现为卦形；通写正文，原字留在 notes。
    for (const block of blocks) assert.doesNotMatch(block.original, /[𩔖𤼵𫉬𢘆]/u, `${block.id} 含已确认显示异常的字形`)
  }
  assert.ok(getContent(4)?.statement.original.startsWith('蒙：'))
})
