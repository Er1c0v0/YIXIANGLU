export type YinYang = 0 | 1
export type LinePosition = 1 | 2 | 3 | 4 | 5 | 6
export type TrigramId = 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun'
export type ThreeLines = readonly [YinYang, YinYang, YinYang]
export type SixLines = readonly [YinYang, YinYang, YinYang, YinYang, YinYang, YinYang]

export interface Trigram {
  id: TrigramId
  name: string
  pinyin: string
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

export interface SourceRef { sourceId: string; locator: string; note?: string }
export interface SourceDocument {
  id: string; title: string; authorOrCompiler: string; edition: string
  provider: string; url?: string; revisionOrSnapshot?: string
  accessedAt: string; rightsNote: string
}
export interface ReviewedText {
  id: string; original: string; explanation: string; notes: string[]
  originalRefs: SourceRef[]; explanationRefs: SourceRef[]; reviewId: string
}
export interface ReviewRecord {
  id: string; subjectId: string; subjectHash: string
  originalStatus: 'pending' | 'passed' | 'needs-fix' | 'not-applicable'
  explanationStatus: 'pending' | 'passed' | 'needs-fix'
  checkedRefs: SourceRef[]; checkedBy: string; checkedAt: string; issues: string[]
}
export interface YaoEntry {
  position: LinePosition; polarity: YinYang; label: string
  text: ReviewedText; smallImage: ReviewedText
  positionExplanation: string; positionReviewId: string
}
export interface SpecialEntry {
  kind: 'yong-jiu' | 'yong-liu'; text: ReviewedText; smallImage: ReviewedText
  learningNote: string; learningReviewId: string
}
export interface HexagramContent {
  id: number; statement: ReviewedText; tuan: ReviewedText; greatImage: ReviewedText
  summary: string; overallMeaning: string; imagery: string[]
  overviewRefs: SourceRef[]; overviewReviewId: string
  yao: readonly [YaoEntry, YaoEntry, YaoEntry, YaoEntry, YaoEntry, YaoEntry]
  specialEntries: SpecialEntry[]
}
export type CastSession =
  | { mode: 'manual' | 'atlas'; hexagramId: number; selected: LinePosition[] }
  | { mode: 'number'; hexagramId: number; fixed: LinePosition; rawInputs: readonly [string, string, string] }
