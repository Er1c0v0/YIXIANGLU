import { readFile, writeFile, readdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { validateContent } from './content-lib.mjs'

const root = new URL('../',import.meta.url)
const load = async file => JSON.parse(await readFile(new URL(file,root),'utf8'))
const files = (await readdir(new URL('content/hexagrams/',root))).filter(file=>file.endsWith('.json')).sort()
const contents = (await Promise.all(files.map(file=>load(`content/hexagrams/${file}`)))).sort((a,b)=>a.id-b.id)
const [sources,reviews] = await Promise.all(['content/sources.json','content/reviews.json'].map(load))
const command = process.argv[2]
assert.ok(['build','check','release'].includes(command),'用法：tsx scripts/content.mjs build|check|release')
const manifest = validateContent({contents,sources,reviews},{release:command==='release'})
const output = `// 由 scripts/content.mjs 构建。请编辑 content/ 源文件，再重新核对和构建。\nimport { HexagramContent, SourceDocument } from '../domain/types'\n\nexport const DATA_VERSION = '${manifest.dataVersion}'\nexport const BUILD_HASH = '${manifest.buildHash}'\nexport const SOURCES: readonly SourceDocument[] = ${JSON.stringify(sources,null,2)}\nexport const HEXAGRAM_CONTENT: readonly HexagramContent[] = ${JSON.stringify(contents,null,2)}\n`
for (const [file,text] of [['miniprogram/data/content.ts',output],['content/manifest.json',JSON.stringify(manifest,null,2)+'\n']]) {
  const destination = new URL(file,root)
  if (command==='build') await writeFile(destination,text)
  else assert.equal(await readFile(destination,'utf8'),text,`${file} 已过期，请重新构建`)
}
console.log(`${contents.length} 卦 / ${manifest.counts.originalBlocks} 原文块 / ${reviews.length} 审核记录：结构、引用、顺序及哈希通过。`)
console.log(`缺 ${manifest.missingHexagramIds.length} 卦 / ${964-manifest.counts.originalBlocks} 原文块；电子待审 ${manifest.reviews.electronicOriginal.outstanding}，影印待审 ${manifest.reviews.facsimileOriginal.outstanding}，展示释义待审 ${manifest.reviews.displayExplanation.outstanding}，留档白话待审 ${manifest.reviews.archivedExplanation.outstanding}。`)
console.log(`数据 ${manifest.dataVersion} · SHA-256 ${manifest.buildHash}`)
