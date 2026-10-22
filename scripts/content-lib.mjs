import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import assert from 'node:assert/strict'
import { getHexagram } from '../miniprogram/domain/hexagrams.ts'
import { lineName } from '../miniprogram/domain/casting.ts'
import { TRIGRAMS } from '../miniprogram/domain/trigrams.ts'

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}
export const hash = value => createHash('sha256').update(canonical(value)).digest('hex')
const required = (value, label) => assert.ok(typeof value === 'string' && value.trim(), `缺少 ${label}`)
const status = value => ['pending','passed','needs-fix','not-applicable'].includes(value)
const subjectOf = (value, keys) => Object.fromEntries(keys.map(key => [key,value[key]]))

export function readContent() {
  const directory = new URL('../content/', import.meta.url)
  const load = file => JSON.parse(readFileSync(new URL(file, directory), 'utf8'))
  const knownFiles = ['sources.json','manifest.json','search.json','imagery.json','elements.json']
  for (const file of readdirSync(directory).filter(file => file.endsWith('.json'))) assert.ok(knownFiles.includes(file), `未知内容文件类别 ${file}`)
  const contents = readdirSync(new URL('hexagrams/', directory)).filter(file => file.endsWith('.json'))
    .map(file => load(`hexagrams/${file}`)).sort((a,b) => a.id-b.id)
  return { contents, sources: load('sources.json'), reviews: expandReviews(readReviewFiles()),
    search: load('search.json'), imagery: load('imagery.json'), relations: load('elements.json') }
}

export function readReviewFiles() {
  const directory = new URL('../content/reviews/', import.meta.url)
  const load = name => JSON.parse(readFileSync(new URL(name, directory), 'utf8'))
  const files = readdirSync(directory).filter(name => name.endsWith('.json') && name !== 'methods.json').sort()
  const records = files.flatMap(name => {
    const records = load(name)
    if (name === 'search.json') assert.ok(records.every(record => /^search-\d+$/.test(record.subjectId)), '检索审核归属不符')
    else if (name === 'trigrams.json') assert.ok(records.every(record => /^(imagery-|element-)/.test(record.subjectId)), '八卦审核归属不符')
    else {
      assert.match(name, /^(0[1-9]|[1-5][0-9]|6[0-4])\.json$/, '未知审核文件类别')
      assert.ok(records.every(record => record.subjectId.startsWith(`h${Number(name.slice(0, 2))}-`)), `审核卦归属不符 ${name}`)
    }
    return records
  })
  return { methods: load('methods.json'), records }
}

// 只复用核对流程和共同问题；审核状态始终在每条记录中明确保存。
export function expandReviews({ methods, records }) {
  for (const method of Object.values(methods)) {
    assert.deepEqual(Object.keys(method).sort(), ['checkedAt','checkedBy','issues'], '核对流程只允许日期、流程说明及共同问题')
    required(method.checkedBy, '实际核对流程'); required(method.checkedAt, '核对日期')
    assert.ok(Array.isArray(method.issues), '缺少共同问题列表')
  }
  const used = new Set()
  const reviews = records.map(({ method, ...record }) => {
    assert.ok(Object.hasOwn(methods, method), `核对流程悬空 ${method}`)
    assert.ok(!Object.hasOwn(record, 'checkedBy') && !Object.hasOwn(record, 'checkedAt'), '核对流程字段不得重复声明')
    assert.ok(Array.isArray(record.issues), `缺少审核问题列表 ${record.id}`)
    used.add(method)
    return { ...record, checkedBy: methods[method].checkedBy, checkedAt: methods[method].checkedAt, issues: [...methods[method].issues, ...record.issues] }
  })
  assert.equal(used.size, Object.keys(methods).length, '存在无关联核对流程')
  return reviews
}

export function validateContent({ contents, sources, reviews, search, imagery, relations }, { release = false } = {}) {
  const sourceMap = new Map(sources.map(source => [source.id,source]))
  const reviewMap = new Map(reviews.map(record => [record.id,record]))
  assert.equal(sourceMap.size,sources.length,'来源重复')
  assert.equal(reviewMap.size,reviews.length,'审核 ID 重复')
  assert.equal(new Set(contents.map(content => content.id)).size,contents.length,'卦 ID 重复')
  for (const source of sources) {
    for (const key of ['id','title','authorOrCompiler','edition','provider','accessedAt','rightsNote','revisionOrSnapshot']) required(source[key],`来源 ${key}`)
    if (source.url !== undefined) assert.match(source.url, /^https?:\/\//, '来源网址无效')
  }
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
  const searchReviews = [], imageryReviews = [], relationReviews = []
  const trigrams = TRIGRAMS.map(t => t.id)
  const categories = ['nature','quality','family','animal','body','later-direction','gate','season','element','number','earlier-direction','color']
  function lookupReview(entry, subjectId, records, refs = entry.refs) {
    required(entry.reviewId, '资料审核ID')
    const { reviewId, ...subject } = entry
    const record = review(reviewId, subjectId, subject, refs)
    assert.notEqual(record.originalStatus, 'not-applicable', '资料核对不可不适用')
    assert.ok(['pending','passed','needs-fix'].includes(record.independentReviewStatus), '缺少资料独立复审状态')
    if (!entry.explanation) assert.equal(record.explanationStatus, 'not-applicable', '无说明时审核应为不适用')
    else assert.notEqual(record.explanationStatus, 'not-applicable', '有说明时审核不可不适用')
    records.push(record)
  }
  if (search.length) {
    assert.equal(search.length, 64, '检索需要64卦')
    assert.equal(new Set(search.map(e => e.id)).size, 64, '检索ID重复')
    for (const entry of search) {
      const meta = getHexagram(entry.id)
      for (const key of ['name','fullName','upper','lower']) assert.equal(entry[key], meta[key], `检索元数据不符 ${entry.id}/${key}`)
      assert.ok(Array.isArray(entry.traditionalNames) && entry.traditionalNames.length >= 2, '缺少繁体卦名及全称')
      entry.traditionalNames.forEach(value => required(value, '繁体名称'))
      for (const key of ['pinyin','fullNamePinyin']) assert.match(entry[key], /^[a-zü]+(?: [a-zü]+)*$/, '拼音须为小写无声调音节')
      assert.equal(entry.pinyin.split(' ').length, [...entry.name].length, '卦名拼音音节不符')
      assert.equal(entry.fullNamePinyin.split(' ').length, [...entry.fullName].length, '全称拼音音节不符')
      assert.deepEqual(entry.pinyinInitials, [...new Set([entry.pinyin,entry.fullNamePinyin].map(value => value.split(' ').map(word => word[0]).join('')))], '拼音首字母不符')
      assert.ok(Array.isArray(entry.aliases), '缺少别名列表')
      for (const alias of entry.aliases) { required(alias.value, '别名'); resolve(alias.refs) }
      lookupReview(entry, `search-${entry.id}`, searchReviews, [...entry.refs,...entry.aliases.flatMap(alias => alias.refs)])
    }
  }
  assert.equal(new Set(imagery.map(e => e.id)).size, imagery.length, '意象ID重复')
  for (const entry of imagery) {
    assert.ok(entry.id.startsWith('imagery-'), '意象ID不符')
    assert.ok(trigrams.includes(entry.trigram), '意象卦归属无效')
    assert.ok(categories.includes(entry.category), '意象类别无效')
    assert.ok(['zhouyi-shuogua','classroom','later-xiangshu','qimen'].includes(entry.tradition), '意象体系无效')
    assert.ok(Array.isArray(entry.values) && entry.values.length, '意象值为空')
    entry.values.forEach(value => required(value, '意象值'))
    assert.equal(typeof entry.explanation, 'string', '缺少说明字段')
    if (entry.category === 'gate') assert.equal(entry.tradition, 'qimen', '八门须标注奇门体系')
    lookupReview(entry, entry.id, imageryReviews)
  }
  if (imagery.length) for (const trigram of trigrams) {
    for (const category of categories) assert.ok(imagery.some(e => e.trigram === trigram && e.category === category), `意象缺项 ${trigram}/${category}`)
    for (const category of categories.slice(0,8)) assert.equal(imagery.filter(e => e.trigram === trigram && e.category === category && e.refs.some(ref => ref.sourceId === 'prd-classroom')).length, 1, `课堂资料须完整且不重复 ${trigram}/${category}`)
    const number = imagery.find(e => e.trigram === trigram && e.category === 'number')
    assert.deepEqual(number.values, [String(TRIGRAMS.find(t => t.id === trigram).number)], '先天数与结构数据不符')
  }
  const elements = ['wood','fire','earth','metal','water']
  assert.equal(new Set(relations.map(e => e.id)).size, relations.length, '生克ID重复')
  for (const entry of relations) {
    assert.ok(entry.id.startsWith('element-'), '生克ID不符')
    assert.ok(elements.includes(entry.from) && elements.includes(entry.to) && entry.from !== entry.to, '生克端点无效')
    assert.ok(['generates','controls'].includes(entry.relation), '生克类型无效')
    assert.equal(entry.tradition, 'later-xiangshu', '生克须标注后世象数体系')
    lookupReview(entry, entry.id, relationReviews)
  }
  if (relations.length) for (const relation of ['generates','controls']) {
    const entries = relations.filter(e => e.relation === relation)
    assert.equal(entries.length, 5, '相生相克各须5条')
    assert.equal(new Set(entries.map(e => e.from)).size, 5, '生克起点重复')
    assert.equal(new Set(entries.map(e => e.to)).size, 5, '生克终点重复')
  }
  assert.equal(usedReviews.size,reviews.length,'存在无关联审核')
  const count = (records,key) => ({ passed:records.filter(r => r[key]==='passed').length, outstanding:records.filter(r => r[key]!=='passed' && r[key]!=='not-applicable').length, notApplicable:records.filter(r => r[key]==='not-applicable').length })
  const buildHash = hash({contents,sources,reviews,search,imagery,relations})
  const manifest = {
    schemaVersion:3,
    dataVersion:`3.${buildHash.slice(0,12)}`,
    buildHash,
    counts:{hexagrams:contents.length,originalBlocks:textIds.size,reviewRecords:reviews.length,sources:sources.length,search:search.length,imagery:imagery.length,elementRelations:relations.length},
    target:{hexagrams:64,originalBlocks:964,search:64,minimumImagery:96,elementRelations:10},
    missingHexagramIds:Array.from({length:64},(_,i)=>i+1).filter(id=>!contents.some(c=>c.id===id)),
    reviews:{electronicOriginal:count(textReviews,'originalStatus'),facsimileOriginal:count(textReviews,'facsimileStatus'),independentOriginal:count(textReviews,'independentReviewStatus'),displayExplanation:count(displayReviews,'explanationStatus'),independentDisplay:count(displayReviews,'independentReviewStatus'),archivedExplanation:count(archiveReviews,'explanationStatus'),noExplanation:textReviews.length-archiveReviews.length,
      search:count(searchReviews,'originalStatus'),independentSearch:count(searchReviews,'independentReviewStatus'),
      imagery:count(imageryReviews,'originalStatus'),imageryExplanation:count(imageryReviews,'explanationStatus'),independentImagery:count(imageryReviews,'independentReviewStatus'),
      elementRelations:count(relationReviews,'originalStatus'),independentRelations:count(relationReviews,'independentReviewStatus')},
  }
  if (release) {
    assert.equal(manifest.counts.hexagrams,64,'全库发布需要 64 卦')
    assert.equal(manifest.counts.originalBlocks,964,'全库发布需要 964 原文块')
    for (const record of textReviews) assert.ok(record.originalStatus==='passed' && record.facsimileStatus==='passed' && record.independentReviewStatus==='passed',`发布原文审核未完成 ${record.id}`)
    for (const record of displayReviews) assert.ok(record.explanationStatus==='passed' && record.independentReviewStatus==='passed',`发布展示释义审核未完成 ${record.id}`)
    assert.equal(search.length,64,'发布检索需要64卦')
    assert.ok(imagery.length>=96 && relations.length===10,'发布八卦资料未齐全')
    for (const record of [...searchReviews,...imageryReviews,...relationReviews]) assert.ok(record.originalStatus==='passed' && record.independentReviewStatus==='passed' && ['passed','not-applicable'].includes(record.explanationStatus), `发布查询资料审核未完成 ${record.id}`)
  }
  return manifest
}
