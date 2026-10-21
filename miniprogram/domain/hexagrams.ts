import { HexagramMeta, SixLines, TrigramId } from './types'
import { TRIGRAMS } from './trigrams'

// 行为上卦，列为下卦；下三爻占低位。卦序和 mask 独立。
const COMBINATIONS = [
  [1, 10, 13, 25, 44, 6, 33, 12],
  [43, 58, 49, 17, 28, 47, 31, 45],
  [14, 38, 30, 21, 50, 64, 56, 35],
  [34, 54, 55, 51, 32, 40, 62, 16],
  [9, 61, 37, 42, 57, 59, 53, 20],
  [5, 60, 63, 3, 48, 29, 39, 8],
  [26, 41, 22, 27, 18, 4, 52, 23],
  [11, 19, 36, 24, 46, 7, 15, 2],
]
const NAMES = '乾 坤 屯 蒙 需 讼 师 比 小畜 履 泰 否 同人 大有 谦 豫 随 蛊 临 观 噬嗑 贲 剥 复 无妄 大畜 颐 大过 坎 离 咸 恒 遁 大壮 晋 明夷 家人 睽 蹇 解 损 益 夬 姤 萃 升 困 井 革 鼎 震 艮 渐 归妹 丰 旅 巽 兑 涣 节 中孚 小过 既济 未济'.split(' ')
const NATURES = ['天', '泽', '火', '雷', '风', '水', '山', '地']

export const HEXAGRAMS: readonly HexagramMeta[] = TRIGRAMS.flatMap((upper, row) =>
  TRIGRAMS.map((lower, col) => {
    const id = COMBINATIONS[row][col]
    const name = NAMES[id - 1]
    return {
      id, name,
      fullName: row === col ? `${name}为${NATURES[row]}` : `${NATURES[row]}${NATURES[col]}${name}`,
      upper: upper.id, lower: lower.id,
      lines: [...lower.lines, ...upper.lines] as SixLines,
    }
  })
).sort((a, b) => a.id - b.id)

export function getHexagram(id: number): HexagramMeta {
  const hexagram = HEXAGRAMS[id - 1]
  if (!Number.isInteger(id) || !hexagram) throw new Error('无效的六十四卦 ID')
  return hexagram
}

export function combine(upper: TrigramId, lower: TrigramId): HexagramMeta {
  const row = TRIGRAMS.findIndex(item => item.id === upper)
  const col = TRIGRAMS.findIndex(item => item.id === lower)
  if (row < 0 || col < 0) throw new Error('无效的上下卦')
  return getHexagram(COMBINATIONS[row][col])
}

export function linesToMask(lines: SixLines): number {
  return lines.reduce<number>((mask, line, index) => mask | (line << index), 0)
}

const BY_MASK = new Map(HEXAGRAMS.map(item => [linesToMask(item.lines), item]))
export function fromMask(mask: number): HexagramMeta {
  const hexagram = BY_MASK.get(mask)
  if (!hexagram) throw new Error('无效的六爻编码')
  return hexagram
}
