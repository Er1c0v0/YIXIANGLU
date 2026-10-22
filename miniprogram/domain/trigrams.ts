import { Trigram } from './types'

export const TRIGRAMS: readonly Trigram[] = [
  { id: 'qian', name: '乾', number: 1, lines: [1, 1, 1] },
  { id: 'dui', name: '兑', number: 2, lines: [1, 1, 0] },
  { id: 'li', name: '离', number: 3, lines: [1, 0, 1] },
  { id: 'zhen', name: '震', number: 4, lines: [1, 0, 0] },
  { id: 'xun', name: '巽', number: 5, lines: [0, 1, 1] },
  { id: 'kan', name: '坎', number: 6, lines: [0, 1, 0] },
  { id: 'gen', name: '艮', number: 7, lines: [0, 0, 1] },
  { id: 'kun', name: '坤', number: 8, lines: [0, 0, 0] },
]

export function getTrigram(id: string): Trigram {
  const trigram = TRIGRAMS.find(item => item.id === id)
  if (!trigram) throw new Error('无效的八卦 ID')
  return trigram
}
