import { readFile, writeFile, readdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { readReviewFiles, expandReviews, validateContent } from './content-lib.mjs'

const root = new URL('../',import.meta.url)
const load = async file => JSON.parse(await readFile(new URL(file,root),'utf8'))
const files = (await readdir(new URL('content/hexagrams/',root))).filter(file=>file.endsWith('.json')).sort()
const contents = (await Promise.all(files.map(file=>load(`content/hexagrams/${file}`)))).sort((a,b)=>a.id-b.id)
const sources = await load('content/sources.json')
const reviews = expandReviews(readReviewFiles())
const search = await load('content/search.json')
const imagery = await load('content/imagery.json')
const relations = await load('content/elements.json')
const knownFiles = ['sources.json','manifest.json','search.json','imagery.json','elements.json']
for (const file of (await readdir(new URL('content/',root))).filter(file => file.endsWith('.json'))) assert.ok(knownFiles.includes(file), `未知内容文件类别 ${file}`)
const command = process.argv[2]
assert.ok(['build','check','release'].includes(command),'用法：tsx scripts/content.mjs build|check|release')
const manifest = validateContent({contents,sources,reviews,search,imagery,relations},{release:command==='release'})
const header = '// 由 scripts/content.mjs 构建。请编辑 content/ 源文件，再重新核对和构建。\n'
const output = `${header}import { HexagramContent } from '../domain/types'\n\nexport const DATA_VERSION = '${manifest.dataVersion}'\nexport const BUILD_HASH = '${manifest.buildHash}'\nexport const HEXAGRAM_CONTENT: readonly HexagramContent[] = ${JSON.stringify(contents,null,2)}\n`
const sourceOutput = `${header}import { SourceDocument } from '../domain/types'\nexport const SOURCES: readonly SourceDocument[] = ${JSON.stringify(sources,null,2)}\n`
const searchOutput = `${header}import { HexagramSearchEntry } from '../domain/types'\nexport const SEARCH_ENTRIES: readonly HexagramSearchEntry[] = ${JSON.stringify(search)}\n`
const trigramOutput = `${header}import { ImageryEntry, ElementRelation } from '../domain/types'\nexport const IMAGERY: readonly ImageryEntry[] = ${JSON.stringify(imagery)}\nexport const ELEMENT_RELATIONS: readonly ElementRelation[] = ${JSON.stringify(relations)}\n`
for (const [file,text] of [['miniprogram/data/content.ts',output],['miniprogram/data/sources.ts',sourceOutput],['miniprogram/data/search.ts',searchOutput],['miniprogram/data/trigrams.ts',trigramOutput],['content/manifest.json',JSON.stringify(manifest,null,2)+'\n']]) {
  const destination = new URL(file,root)
  if (command==='build') await writeFile(destination,text)
  else assert.equal(await readFile(destination,'utf8'),text,`${file} 已过期，请重新构建`)
}
console.log(`${contents.length} 卦 / ${manifest.counts.originalBlocks} 原文块 / ${reviews.length} 审核记录：结构、引用、顺序及哈希通过。`)
console.log(`缺 ${manifest.missingHexagramIds.length} 卦 / ${964-manifest.counts.originalBlocks} 原文块；电子待审 ${manifest.reviews.electronicOriginal.outstanding}，影印待审 ${manifest.reviews.facsimileOriginal.outstanding}，展示释义待审 ${manifest.reviews.displayExplanation.outstanding}，留档白话待审 ${manifest.reviews.archivedExplanation.outstanding}。`)
console.log(`数据 ${manifest.dataVersion} · SHA-256 ${manifest.buildHash}`)
console.log(`检索 ${search.length} / 意象 ${imagery.length} / 生克 ${relations.length}；独立待审 ${manifest.reviews.independentSearch.outstanding + manifest.reviews.independentImagery.outstanding + manifest.reviews.independentRelations.outstanding}，新说明待审 ${manifest.reviews.imageryExplanation.outstanding}。`)
