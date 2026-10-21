import { Trigram } from './types'

export const TRIGRAMS: readonly Trigram[] = [
  { id: 'qian', name: '乾', pinyin: 'qian', number: 1, lines: [1, 1, 1] },
  { id: 'dui', name: '兑', pinyin: 'dui', number: 2, lines: [1, 1, 0] },
  { id: 'li', name: '离', pinyin: 'li', number: 3, lines: [1, 0, 1] },
  { id: 'zhen', name: '震', pinyin: 'zhen', number: 4, lines: [1, 0, 0] },
  { id: 'xun', name: '巽', pinyin: 'xun', number: 5, lines: [0, 1, 1] },
  { id: 'kan', name: '坎', pinyin: 'kan', number: 6, lines: [0, 1, 0] },
  { id: 'gen', name: '艮', pinyin: 'gen', number: 7, lines: [0, 0, 1] },
  { id: 'kun', name: '坤', pinyin: 'kun', number: 8, lines: [0, 0, 0] },
]

export function getTrigram(id: string): Trigram {
  const trigram = TRIGRAMS.find(item => item.id === id)
  if (!trigram) throw new Error('无效的八卦 ID')
  return trigram
}
