import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { getHexagram } from '../miniprogram/domain/hexagrams.ts'
import { lineName } from '../miniprogram/domain/casting.ts'

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}
export const hash = value => createHash('sha256').update(canonical(value)).digest('hex')
const required = (value, label) => assert.ok(typeof value === 'string' && value.trim(), `缺少 ${label}`)
const status = value => ['pending','passed','needs-fix','not-applicable'].includes(value)
const subjectOf = (value, keys) => Object.fromEntries(keys.map(key => [key,value[key]]))

export function validateContent({ contents, sources, reviews }, { release = false } = {}) {
  const sourceMap = new Map(sources.map(source => [source.id,source]))
  const reviewMap = new Map(reviews.map(record => [record.id,record]))
  assert.equal(sourceMap.size,sources.length,'来源重复')
  assert.equal(reviewMap.size,reviews.length,'审核 ID 重复')
  assert.equal(new Set(contents.map(content => content.id)).size,contents.length,'卦 ID 重复')
  for (const source of sources) for (const key of ['id','title','authorOrCompiler','edition','provider','url','accessedAt','rightsNote','revisionOrSnapshot']) required(source[key],`来源 ${key}`)
  function resolve(refs) {
    assert.ok(Array.isArray(refs) && refs.length,'缺少来源引用')
    return refs.map(ref => {
      required(ref.locator,'段落定位')
      assert.ok(sourceMap.has(ref.sourceId),`来源悬空 ${ref.sourceId}`)
      return sourceMap.get(ref.sourceId)
    })
  }
  const usedReviews = new Set(), textIds = new Set(), textReviews = [], displayReviews = [], archiveReviews = []
  function review(id, subjectId, subject, refs) {
    const resolved = resolve(refs), record = reviewMap.get(id)
    assert.ok(record,`缺少审核 ${id}`)
    assert.equal(record.subjectId,subjectId,`审核对象不符 ${id}`)
    assert.equal(record.subjectHash,hash({subject,sources:resolved}),`审核已过期 ${id}；须重新核对，不能靠构建刷新审核`)
    assert.ok(status(record.originalStatus) && status(record.explanationStatus),`审核状态不符 ${id}`)
    for (const key of ['facsimileStatus','independentReviewStatus']) if (record[key] !== undefined) assert.ok(['pending','passed','needs-fix'].includes(record[key]),`审核状态不符 ${id}/${key}`)
    required(record.checkedBy,'实际核对流程'); required(record.checkedAt,'核对日期'); resolve(record.checkedRefs)
    assert.ok(Array.isArray(record.issues),`缺少审核问题列表 ${id}`)
    assert.ok(!usedReviews.has(id),`审核重复关联 ${id}`); usedReviews.add(id)
    return record
  }
  function text(block) {
    for (const key of ['id','original','reviewId']) required(block[key],key)
    assert.ok(!textIds.has(block.id),`正文 ID 重复 ${block.id}`); textIds.add(block.id)
    assert.ok(Array.isArray(block.notes),'缺少注释列表')
    resolve(block.originalRefs)
    const hasExplanation = block.explanation !== undefined
    if (hasExplanation) { required(block.explanation,'白话'); resolve(block.explanationRefs) }
    else assert.equal(block.explanationRefs,undefined,'无白话时不应有白话引用')
    const { reviewId, ...subject } = block
    const record = review(reviewId,block.id,subject,[...block.originalRefs,...(block.explanationRefs || [])])
    assert.notEqual(record.originalStatus,'not-applicable','原文审核不可不适用')
    if (!hasExplanation) assert.equal(record.explanationStatus,'not-applicable','无白话时审核应为不适用')
    else { assert.notEqual(record.explanationStatus,'not-applicable','已有白话审核不可不适用'); archiveReviews.push(record) }
    textReviews.push(record)
  }
  for (const content of contents) {
    const meta = getHexagram(content.id)
    for (const key of ['statement','tuan','greatImage']) text(content[key])
    for (const key of ['summary','overallMeaning']) required(content[key],key)
    assert.ok(Array.isArray(content.imagery) && content.imagery.length,'缺少意象')
    content.imagery.forEach(item => required(item,'意象'))
    const overview = subjectOf(content,['summary','overallMeaning','imagery','overviewRefs'])
    displayReviews.push(review(content.overviewReviewId,`h${content.id}-overview`,overview,content.overviewRefs))
    assert.equal(content.yao.length,6,'六爻数量不符')
    content.yao.forEach((yao,i) => {
      assert.equal(yao.position,i+1,'六爻必须从下到上')
      assert.equal(yao.polarity,meta.lines[i],'爻阴阳不符')
      assert.equal(yao.label,lineName(meta.lines,i+1),'爻名不符')
      text(yao.text); text(yao.smallImage)
      if (yao.positionExplanation !== undefined || yao.positionReviewId !== undefined) {
        required(yao.positionExplanation,'爻位说明')
        review(yao.positionReviewId,`h${content.id}-position-${i+1}`,subjectOf(yao,['position','polarity','label','positionExplanation']),content.overviewRefs)
      }
    })
    assert.deepEqual(content.specialEntries.map(item => item.kind),content.id===1?['yong-jiu']:content.id===2?['yong-liu']:[],'特殊条文归属不符')
    for (const special of content.specialEntries) {
      text(special.text); text(special.smallImage); required(special.learningNote,'特殊条文说明')
      displayReviews.push(review(special.learningReviewId,`h${content.id}-special-note`,{learningNote:special.learningNote},special.text.originalRefs))
    }
  }
  assert.equal(usedReviews.size,reviews.length,'存在无关联审核')
  const count = (records,key) => ({ passed:records.filter(r => r[key]==='passed').length, outstanding:records.filter(r => r[key]!=='passed' && r[key]!=='not-applicable').length, notApplicable:records.filter(r => r[key]==='not-applicable').length })
  const manifest = {
    schemaVersion:2,
    dataVersion:`2.${hash({contents,sources,reviews}).slice(0,12)}`,
    buildHash:hash({contents,sources,reviews}),
    counts:{hexagrams:contents.length,originalBlocks:textIds.size,reviewRecords:reviews.length},
    target:{hexagrams:64,originalBlocks:964},
    missingHexagramIds:Array.from({length:64},(_,i)=>i+1).filter(id=>!contents.some(c=>c.id===id)),
    reviews:{electronicOriginal:count(textReviews,'originalStatus'),facsimileOriginal:count(textReviews,'facsimileStatus'),independentOriginal:count(textReviews,'independentReviewStatus'),displayExplanation:count(displayReviews,'explanationStatus'),independentDisplay:count(displayReviews,'independentReviewStatus'),archivedExplanation:count(archiveReviews,'explanationStatus'),noExplanation:textReviews.length-archiveReviews.length},
  }
  if (release) {
    assert.equal(manifest.counts.hexagrams,64,'全库发布需要 64 卦')
    assert.equal(manifest.counts.originalBlocks,964,'全库发布需要 964 原文块')
    for (const record of textReviews) assert.ok(record.originalStatus==='passed' && record.facsimileStatus==='passed' && record.independentReviewStatus==='passed',`发布原文审核未完成 ${record.id}`)
    for (const record of displayReviews) assert.ok(record.explanationStatus==='passed' && record.independentReviewStatus==='passed',`发布展示释义审核未完成 ${record.id}`)
  }
  return manifest
}
