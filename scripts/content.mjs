import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { getHexagram } from '../miniprogram/domain/hexagrams.ts'
import { lineName } from '../miniprogram/domain/casting.ts'

const root = new URL('../', import.meta.url)
const load = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'))
const [samples, sources, reviews] = await Promise.all(['content/samples.json','content/sources.json','content/reviews.json'].map(load))
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}
const hash = value => createHash('sha256').update(canonical(value)).digest('hex')
const required = (value, label) => assert.ok(typeof value === 'string' && value.trim(), `缺少 ${label}`)
const sourceMap = new Map(sources.map(source => [source.id,source]))
const reviewMap = new Map(reviews.map(review => [review.id,review]))
assert.equal(sourceMap.size,sources.length,'来源重复')
assert.equal(reviewMap.size,reviews.length,'审核 ID 重复')
for (const source of sources) for (const key of ['id','title','authorOrCompiler','edition','provider','url','accessedAt','rightsNote','revisionOrSnapshot']) required(source[key],`来源 ${key}`)
function resolve(refs) {
  assert.ok(Array.isArray(refs) && refs.length, '缺少来源引用')
  return refs.map(ref => { required(ref.locator,'段落定位');assert.ok(sourceMap.has(ref.sourceId),`来源悬空 ${ref.sourceId}`);return sourceMap.get(ref.sourceId) })
}
const usedReviews = new Set(), textIds = new Set()
function review(id,subjectId,subject,refs) {
  const resolved=resolve(refs), record=reviewMap.get(id)
  assert.ok(record,`缺少审核 ${id}`)
  assert.equal(record.subjectId,subjectId,`审核对象不符 ${id}`)
  assert.equal(record.subjectHash,hash({subject,sources:resolved}),`审核已过期 ${id}；须重新核对，不能靠构建刷新审核`)
  assert.ok(['pending','passed','needs-fix','not-applicable'].includes(record.originalStatus))
  assert.ok(['pending','passed','needs-fix'].includes(record.explanationStatus))
  required(record.checkedBy,'实际核对流程');required(record.checkedAt,'核对日期');resolve(record.checkedRefs)
  usedReviews.add(id)
}
function text(block) {
  assert.ok(!textIds.has(block.id),`正文 ID 重复 ${block.id}`);textIds.add(block.id)
  for (const key of ['id','original','explanation','reviewId']) required(block[key],key)
  assert.ok(Array.isArray(block.notes));resolve(block.originalRefs);resolve(block.explanationRefs)
  const {reviewId,...subject}=block
  review(reviewId,block.id,subject,[...block.originalRefs,...block.explanationRefs])
}
assert.deepEqual(samples.map(c=>c.id),[1,2,30,43,58])
for (const content of samples) {
  const meta=getHexagram(content.id)
  for (const key of ['statement','tuan','greatImage']) text(content[key])
  for (const key of ['summary','overallMeaning']) required(content[key],key)
  assert.ok(content.imagery.length)
  const overview=Object.fromEntries(['summary','overallMeaning','imagery','overviewRefs'].map(key=>[key,content[key]]))
  review(content.overviewReviewId,`h${content.id}-overview`,overview,content.overviewRefs)
  assert.equal(content.yao.length,6)
  content.yao.forEach((yao,i)=>{
    assert.equal(yao.position,i+1,'六爻必须从下到上');assert.equal(yao.polarity,meta.lines[i]);assert.equal(yao.label,lineName(meta.lines,i+1))
    text(yao.text);text(yao.smallImage);required(yao.positionExplanation,'爻位说明')
    const subject=Object.fromEntries(['position','polarity','label','positionExplanation'].map(key=>[key,yao[key]]))
    review(yao.positionReviewId,`h${content.id}-position-${i+1}`,subject,content.overviewRefs)
  })
  assert.deepEqual(content.specialEntries.map(s=>s.kind),content.id===1?['yong-jiu']:content.id===2?['yong-liu']:[])
  for (const special of content.specialEntries) {
    text(special.text);text(special.smallImage);required(special.learningNote,'特殊条文说明')
    review(special.learningReviewId,`h${content.id}-special-note`,{learningNote:special.learningNote},special.text.originalRefs)
  }
}
assert.equal(usedReviews.size,reviews.length,'存在无关联审核')
const buildHash=hash({samples,sources,reviews})
const output=`// 由 scripts/content.mjs 构建。请编辑 content/ 源文件，再重新核对和构建。\nimport { HexagramContent, SourceDocument } from '../domain/types'\n\nexport const DATA_VERSION = '2026-10-21.prototype-1'\nexport const BUILD_HASH = '${buildHash}'\nexport const SOURCES: readonly SourceDocument[] = ${JSON.stringify(sources,null,2)}\nexport const SAMPLE_CONTENT: readonly HexagramContent[] = ${JSON.stringify(samples,null,2)}\n`
const destination=new URL('miniprogram/data/content.ts',root)
if(process.argv[2]==='build') await writeFile(destination,output)
else { assert.equal(process.argv[2],'check','用法：tsx scripts/content.mjs build|check'); assert.equal(await readFile(destination,'utf8'),output,'随包资料已过期，请重新构建') }
console.log(`五卦 / ${textIds.size} 原文块 / ${reviews.length} 审核记录：结构、引用、顺序及哈希通过；${reviews.filter(r=>r.explanationStatus!=='passed').length} 条释义待复核。电子核对不等于影印本或人工审核。`)
console.log(`数据 2026-10-21.prototype-1 · SHA-256 ${buildHash}`)
