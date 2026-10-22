import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { hash, validateContent } from '../scripts/content-lib.mjs'
import { getContent, getCollectedHexagrams } from '../miniprogram/data/repository'
import { SOURCES } from '../miniprogram/data/content'
import { combine } from '../miniprogram/domain/hexagrams'
import { castNumbers, resultForSession } from '../miniprogram/domain/casting'
import { newFlow, startSession, readSession, sessionRoute } from '../miniprogram/state/session'
import type { CastSession } from '../miniprogram/domain/types'

const load = (file: string) => JSON.parse(readFileSync(file,'utf8'))
const files = readdirSync('content/hexagrams/').filter(file=>file.endsWith('.json')).sort()
const dataset = { contents:files.map(file=>load(`content/hexagrams/${file}`)), sources:load('content/sources.json'), reviews:load('content/reviews.json') }

test('增量资料：无白话正常构建、现有资料读取及全库门槛隔离', () => {
  const manifest = validateContent(dataset)
  assert.deepEqual(manifest.counts,{hexagrams:19,originalBlocks:289,reviewRecords:340})
  assert.equal(manifest.reviews.noExplanation,210)
  assert.equal(manifest.reviews.archivedExplanation.outstanding,1)
  assert.equal(manifest.missingHexagramIds.length,45)
  assert.deepEqual(getCollectedHexagrams().map(item=>item.id),[1,2,3,4,5,6,7,8,9,10,11,12,13,23,26,30,43,44,58])
  assert.equal(getContent(14),undefined)
  assert.equal(manifest.reviews.facsimileOriginal.outstanding,289)
  assert.equal(manifest.reviews.displayExplanation.outstanding,14)
  assert.throws(()=>validateContent(dataset,{release:true}),/64 卦/)
})

test('构建器拒绝重复卦、空原文、坏引用、错序和过期哈希', () => {
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
  // 独立列出第二批上下卦、数字及单爻变化；不从内容清单反推期望值。
  const batch2 = [
    [4,'gen','kan','6','7',7,6],
    [5,'kan','qian','1','6',11,5],
    [6,'qian','kan','6','1',12,2],
    [7,'kun','kan','6','8',2,2],
    [8,'kan','kun','8','6',2,5],
    [9,'xun','qian','1','5',1,4],
    [10,'qian','dui','2','1',1,3],
    [13,'qian','li','3','1',1,2],
  ] as const
  for (const [id,upper,lower,lowerNumber,upperNumber,from,position] of batch2) {
    assert.equal(combine(upper,lower).id,id)
    const number=castNumbers(lowerNumber,upperNumber,'6')
    assert.equal(number.hexagram.id,id)
    const numberSession:CastSession={mode:'number',hexagramId:id,fixed:6,rawInputs:[lowerNumber,upperNumber,'6']}
    newFlow();const url=startSession(numberSession)
    assert.equal(readSession(Object.fromEntries(new URL(url,'https://local').searchParams)),numberSession)
    assert.equal(resultForSession({mode:'manual',hexagramId:from,selected:[position]}).id,id)
    assert.equal(getContent(from)?.yao[position-1].text.id,`h${from}-yao-${position}`)
    const content=getContent(id)!
    assert.equal(content.yao.length,6)
    assert.ok(!content.statement.explanation)
    const source=SOURCES.find(s=>s.id===content.statement.originalRefs[0].sourceId)!
    assert.equal(source.accessedAt,'2026-10-22')
    assert.equal(source.revisionOrSnapshot,id<=6?'9685959':'9685960')
  }
  assert.equal(getContent(4)?.yao[5].smallImage.original,'利用禦宼，上下順也。')
  assert.equal(getContent(7)?.statement.original,'師：貞，丈人吉，无咎。')
  assert.equal(getContent(9)?.yao[2].text.original,'輿說輻，夫妻反目。')
  assert.ok(getContent(9)?.yao[5].text.original.includes('尚德載'))
  assert.ok(!getContent(10)?.tuan.original.includes('利貞'))
  assert.equal(getContent(13)?.yao[3].text.original,'乘其墉，弗克攻，吉。')
  for (const id of [3,4,5,6,7,8,9,10,11,12,13,23,26,44]) {
    const c=getContent(id)!
    for (const block of [c.statement,c.tuan,c.greatImage,...c.yao.flatMap(yao=>[yao.text,yao.smallImage])]) {
      assert.ok(block.id.startsWith(`h${id}-`))
      for (const ref of block.originalRefs) { assert.ok(SOURCES.find(s=>s.id===ref.sourceId)?.url?.includes('oldid=')); assert.match(ref.locator,/0007冊\.djvu\//) }
    }
  }
})
