export type YinYang = 0 | 1
export type LinePosition = 1 | 2 | 3 | 4 | 5 | 6
export type TrigramId = 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun'
export type ThreeLines = readonly [YinYang, YinYang, YinYang]
export type SixLines = readonly [YinYang, YinYang, YinYang, YinYang, YinYang, YinYang]

export interface Trigram {
  id: TrigramId
  name: string
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  lines: ThreeLines
}

export interface HexagramMeta {
  id: number
  name: string
  fullName: string
  upper: TrigramId
  lower: TrigramId
  lines: SixLines
}

export interface HexagramSearchEntry {
  id: number; name: string; fullName: string; upper: TrigramId; lower: TrigramId
  traditionalNames: string[]
  aliases: { value: string }[]
  pinyin: string; fullNamePinyin: string; pinyinInitials: string[]
}

export interface ImageryEntry {
  id: string; trigram: TrigramId
  category: 'nature' | 'quality' | 'family' | 'animal' | 'body'
    | 'later-direction' | 'gate' | 'season' | 'element' | 'color'
  values: string[]
}

export interface ElementRelation {
  id: string
  from: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  to: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  relation: 'generates' | 'controls'
}

export interface SourceRef { sourceId: string; locator: string; note?: string }
export interface SourceDocument {
  id: string; title: string; authorOrCompiler: string; edition: string
  provider: string; url?: string; revisionOrSnapshot?: string
  accessedAt: string; rightsNote: string
}
export interface ReviewedText {
  id: string; original: string; originalRefs: SourceRef[]
}
export interface YaoEntry {
  position: LinePosition; label: string
  text: ReviewedText; smallImage: ReviewedText
}
export interface SpecialEntry {
  kind: 'yong-jiu' | 'yong-liu'; text: ReviewedText; smallImage: ReviewedText
}
export interface HexagramContent {
  id: number; statement: ReviewedText; tuan: ReviewedText; greatImage: ReviewedText
  summary: string; overallMeaning: string; imagery: string[]
  overviewRefs: SourceRef[]
  yao: readonly [YaoEntry, YaoEntry, YaoEntry, YaoEntry, YaoEntry, YaoEntry]
  specialEntries: SpecialEntry[]
}
export type CastSession =
  | { mode: 'manual' | 'atlas'; hexagramId: number; selected: LinePosition[] }
  | { mode: 'number'; hexagramId: number; fixed: LinePosition }
