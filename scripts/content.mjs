import { readFile, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { readContent, validateContent } from './content-lib.mjs'

const root = new URL('../',import.meta.url)
const dataset = readContent()
const {contents,sources,reviews,search,imagery,relations} = dataset
const command = process.argv[2]
assert.ok(['build','check','release'].includes(command),'用法：tsx scripts/content.mjs build|check|release')
const manifest = validateContent(dataset,{release:command==='release'})
// 运行包只保留页面使用的数据；正文、异文、白话与审核档案仍完整留在 content/。
const runtimeText = ({original, originalRefs}) => ({original, originalRefs})
const runtimeContents = contents.map(content => ({
  id: content.id, statement: runtimeText(content.statement), tuan: runtimeText(content.tuan),
  greatImage: runtimeText(content.greatImage), summary: content.summary,
  overallMeaning: content.overallMeaning, imagery: content.imagery, overviewRefs: content.overviewRefs,
  yao: content.yao.map(({position, label, text, smallImage}) => ({
    position, label, text: runtimeText(text), smallImage: runtimeText(smallImage),
  })),
  specialEntries: content.specialEntries.map(({kind, text, smallImage}) => ({
    kind, text: runtimeText(text), smallImage: runtimeText(smallImage),
  })),
}))
const sourceIds = new Set(runtimeContents.flatMap(content => [
  ...content.overviewRefs,
  ...[content.statement, content.tuan, content.greatImage,
    ...content.yao.flatMap(yao => [yao.text, yao.smallImage]),
    ...content.specialEntries.flatMap(entry => [entry.text, entry.smallImage]),
  ].flatMap(text => text.originalRefs),
]).map(ref => ref.sourceId))
const runtimeSources = sources.filter(source => sourceIds.has(source.id))
const runtimeSearch = search.map(({id, name, fullName, upper, lower, traditionalNames, aliases, pinyin, fullNamePinyin, pinyinInitials}) => ({
  id, name, fullName, upper, lower, traditionalNames, aliases: aliases.map(({value}) => ({value})), pinyin, fullNamePinyin, pinyinInitials,
}))
// 速查统一用简体卦性词；說在此读作悦。所引原词与审核仍保留在 content/。
const simplifiedQualities = { 順: '顺', 動: '动', 麗: '丽', 說: '悦' }
const runtimeImagery = imagery.filter(entry => !['number','earlier-direction'].includes(entry.category))
  .map(({trigram, category, values}) => ({
    trigram, category,
    values: category === 'quality' ? values.map(value => simplifiedQualities[value] || value) : values,
  }))
const runtimeRelations = relations.map(({id, from, to, relation}) => ({id, from, to, relation}))
const header = '// 由 scripts/content.mjs 构建。请编辑 content/ 源文件，再重新核对和构建。\n'
const output = `${header}import { HexagramContent } from '../domain/types'\n\nexport const HEXAGRAM_CONTENT: readonly HexagramContent[] = ${JSON.stringify(runtimeContents,null,2)}\n`
const sourceOutput = `${header}import { SourceDocument } from '../domain/types'\nexport const SOURCES: readonly SourceDocument[] = ${JSON.stringify(runtimeSources,null,2)}\n`
const searchOutput = `${header}import { HexagramSearchEntry } from '../domain/types'\nexport const SEARCH_ENTRIES: readonly HexagramSearchEntry[] = ${JSON.stringify(runtimeSearch)}\n`
const trigramOutput = `${header}import { ImageryEntry, ElementRelation } from '../domain/types'\nexport const IMAGERY: readonly ImageryEntry[] = ${JSON.stringify(runtimeImagery)}\nexport const ELEMENT_RELATIONS: readonly ElementRelation[] = ${JSON.stringify(runtimeRelations)}\n`
for (const [file,text] of [['miniprogram/data/content.ts',output],['miniprogram/data/sources.ts',sourceOutput],['miniprogram/data/search.ts',searchOutput],['miniprogram/data/trigrams.ts',trigramOutput],['content/manifest.json',JSON.stringify(manifest,null,2)+'\n']]) {
  const destination = new URL(file,root)
  if (command==='build') await writeFile(destination,text)
  else assert.equal(await readFile(destination,'utf8'),text,`${file} 已过期，请重新构建`)
}
console.log(`${contents.length} 卦 / ${manifest.counts.originalBlocks} 原文块 / ${reviews.length} 审核记录：结构、引用、顺序及哈希通过。`)
console.log(`缺 ${manifest.missingHexagramIds.length} 卦 / ${964-manifest.counts.originalBlocks} 原文块；电子待审 ${manifest.reviews.electronicOriginal.outstanding}，影印待审 ${manifest.reviews.facsimileOriginal.outstanding}，展示释义待审 ${manifest.reviews.displayExplanation.outstanding}，留档白话待审 ${manifest.reviews.archivedExplanation.outstanding}。`)
console.log(`数据 ${manifest.dataVersion} · SHA-256 ${manifest.buildHash}`)
console.log(`检索 ${search.length} / 意象 ${imagery.length} / 生克 ${relations.length}；独立待审 ${manifest.reviews.independentSearch.outstanding + manifest.reviews.independentImagery.outstanding + manifest.reviews.independentRelations.outstanding}，新说明待审 ${manifest.reviews.imageryExplanation.outstanding}。`)
