import test from 'node:test'
import assert from 'node:assert/strict'
import { readContent, readReviewFiles, expandReviews, hash, validateContent } from '../scripts/content-lib.mjs'
import { getContent } from '../miniprogram/data/repository'
import { HEXAGRAM_CONTENT } from '../miniprogram/data/content'

const dataset = readContent()

test('构建拒绝无效资料，发布拒绝缺卦或未审核原文', () => {
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
    [(d:typeof dataset)=>{
      const block=d.contents[0].statement
      block.originalRefs=[]
      const {reviewId,...subject}=block
      d.reviews.find((r:any)=>r.id===reviewId).subjectHash=hash({subject,sources:block.explanationRefs.map((ref:any)=>d.sources.find((source:any)=>source.id===ref.sourceId))})
    },/缺少来源引用/],
    [(d:typeof dataset)=>d.contents[0].statement.reviewId='missing',/缺少审核/],
    [(d:typeof dataset)=>d.contents[0].yao.reverse(),/六爻必须从下到上/],
    [(d:typeof dataset)=>d.contents[0].statement.original+='改',/审核已过期/],
    [(d:typeof dataset)=>d.sources[0].revisionOrSnapshot+='改',/审核已过期/],
    [(d:typeof dataset)=>d.reviews.find((r:any)=>r.subjectId==='h3-statement').explanationStatus='passed',/无白话时审核应为不适用/],
  ] as const
  for (const [change,message] of cases) { const copy=structuredClone(dataset); change(copy); assert.throws(()=>validateContent(copy),message) }
  const first = dataset.contents[0]
  const partial = { ...dataset, search: [], imagery: [], relations: [], contents: [first], reviews: dataset.reviews.filter(record => record.subjectId.startsWith(`h${first.id}-`)) }
  assert.throws(() => validateContent(partial, { release: true }), /64 卦/)
  const unreviewed = structuredClone(dataset)
  unreviewed.reviews.find(record => record.id === first.statement.reviewId).facsimileStatus = 'pending'
  assert.throws(() => validateContent(unreviewed, { release: true }), /发布原文审核未完成/)
})

test('按ID读取资料与已复现字形问题回归', () => {
  for (const content of HEXAGRAM_CONTENT) {
    assert.equal(getContent(content.id), content)
    const blocks = [content.statement, content.tuan, content.greatImage, ...content.yao.flatMap(yao => [yao.text, yao.smallImage]), ...content.specialEntries.flatMap(entry => [entry.text, entry.smallImage])]
    // 这些录文字形已在模拟器中复现为卦形；通写正文，原字留在 notes。
    for (const block of blocks) assert.doesNotMatch(block.original, /[𩔖𤼵𫉬𢘆]/u, `${block.id} 含已确认显示异常的字形`)
    for (const yao of content.yao) {
      assert.equal(yao.text.id, `h${content.id}-yao-${yao.position}`)
      assert.equal(yao.smallImage.id, `h${content.id}-image-${yao.position}`)
    }
  }
  assert.ok(getContent(4)?.statement.original.startsWith('蒙：'))
})
