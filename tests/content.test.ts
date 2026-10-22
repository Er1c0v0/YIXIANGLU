import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { expandReviews, hash, validateContent } from '../scripts/content-lib.mjs'
import { getContent, getCollectedHexagrams } from '../miniprogram/data/repository'
import { SOURCES } from '../miniprogram/data/content'
import { combine } from '../miniprogram/domain/hexagrams'
import { castNumbers, resultForSession } from '../miniprogram/domain/casting'
import { newFlow, startSession, readSession, sessionRoute } from '../miniprogram/state/session'
import type { CastSession } from '../miniprogram/domain/types'

const load = (file: string) => JSON.parse(readFileSync(file,'utf8'))
const files = readdirSync('content/hexagrams/').filter(file=>file.endsWith('.json')).sort()
const reviewFile = load('content/reviews.json')
const dataset = { contents:files.map(file=>load(`content/hexagrams/${file}`)), sources:load('content/sources.json'), reviews:expandReviews(reviewFile) }

test('增量资料：无白话正常构建、现有资料读取及全库门槛隔离', () => {
  const manifest = validateContent(dataset)
  const ids = dataset.contents.map(content => content.id)
  assert.equal(manifest.counts.hexagrams, ids.length)
  assert.equal(manifest.counts.originalBlocks, ids.length * 15 + ids.filter(id => id <= 2).length * 2)
  assert.equal(manifest.counts.reviewRecords, dataset.reviews.length)
  assert.deepEqual(getCollectedHexagrams().map(item => item.id), ids)
  for (const id of manifest.missingHexagramIds) assert.equal(getContent(id), undefined)
  // 固定用单卦子集验证发布门槛，收齐64卦后仍可运行。
  const partial = { ...dataset, contents: [dataset.contents[0]], reviews: dataset.reviews.filter(record => record.subjectId.startsWith(`h${ids[0]}-`)) }
  assert.throws(() => validateContent(partial, { release: true }), /64 卦/)
})

test('构建器拒绝重复卦、空原文、坏引用、错序和过期哈希', () => {
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
})

test('资料关键流程：上下卦方向、变卦读取及正文来源归属', () => {
  assert.equal(getContent(combine('kun','qian').id)?.statement.original,'泰：小往大來，吉亨。')
  assert.equal(getContent(combine('qian','kun').id)?.statement.id,'h12-statement')
  assert.equal(getContent(combine('kan','zhen').id)?.yao[2].text.id,'h3-yao-3')
  const sessions:CastSession[] = [
    {mode:'manual',hexagramId:1,selected:[1]},
    {mode:'number',hexagramId:castNumbers('8','16','6').hexagram.id,fixed:6,rawInputs:['8','16','6']},
    {mode:'number',hexagramId:castNumbers('9007199254740993','8','6').hexagram.id,fixed:6,rawInputs:['9007199254740993','8','6']},
  ]
  for (const [i,session] of sessions.entries()) {
    newFlow();const url=startSession(session)
    assert.equal(readSession(Object.fromEntries(new URL(url,'https://local').searchParams)),session)
    assert.ok(sessionRoute('analysis').includes(`id=${session.hexagramId}`))
    const result=resultForSession(session), expected=[44,23,26][i]
    assert.equal(result.id,expected)
    assert.ok(getContent(result.id)?.statement.original)
    const position=session.mode==='number'?session.fixed:1
    assert.equal(getContent(session.hexagramId)?.yao[position-1].text.id,`h${session.hexagramId}-yao-${position}`)
  }
  assert.equal(getContent(23)?.yao[5].text.original,'碩果不食，君子得輿，小人剝廬。')
  // 每次录入自动覆盖全部随包正文；具体异文与审核结论保存在内容档案。
  for (const content of dataset.contents) {
    assert.deepEqual(getContent(content.id), content)
    const blocks = [content.statement, content.tuan, content.greatImage, ...content.yao.flatMap(yao => [yao.text, yao.smallImage]), ...content.specialEntries.flatMap(entry => [entry.text, entry.smallImage])]
    // 这些录文字形已在模拟器中复现为卦形；通写正文，原字留在 notes。
    for (const block of blocks) assert.doesNotMatch(block.original, /[𩔖𤼵𫉬𢘆]/u, `${block.id} 含已确认显示异常的字形`)
    for (const yao of content.yao) {
      assert.equal(yao.text.id, `h${content.id}-yao-${yao.position}`)
      assert.equal(yao.smallImage.id, `h${content.id}-image-${yao.position}`)
    }
  }
  assert.deepEqual(SOURCES, dataset.sources)
  assert.ok(getContent(4)?.statement.original.startsWith('蒙：'))
})
