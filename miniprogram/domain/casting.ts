import { CastSession, LinePosition, SixLines } from './types'
import { combine, fromMask, getHexagram, linesToMask } from './hexagrams'
import { TRIGRAMS } from './trigrams'

export const POSITIONS: readonly LinePosition[] = [1, 2, 3, 4, 5, 6]

export function normalizePositiveInteger(raw: string): string {
  const value = raw.trim()
  if (!/^[0-9]+$/.test(value) || !/[1-9]/.test(value)) {
    throw new Error('请输入大于 0 的整数（只含 0～9）')
  }
  return value.replace(/^0+/, '')
}

// 仅接收已规范化字符串，不把整串转为 Number。
export function modDecimal(value: string, divisor: 6 | 8): number {
  let remainder = 0
  for (let i = 0; i < value.length; i++) remainder = (remainder * 10 + value.charCodeAt(i) - 48) % divisor
  return remainder
}

export function castNumbers(lowerRaw: string, upperRaw: string, changeRaw: string) {
  const values = [lowerRaw, upperRaw, changeRaw].map(normalizePositiveInteger)
  const lowerNumber = modDecimal(values[0], 8) || 8
  const upperNumber = modDecimal(values[1], 8) || 8
  const fixed = (modDecimal(values[2], 6) || 6) as LinePosition
  const lower = TRIGRAMS[lowerNumber - 1]
  const upper = TRIGRAMS[upperNumber - 1]
  return { hexagram: combine(upper.id, lower.id), fixed, lower, upper }
}

export function normalizePositions(positions: readonly number[]): LinePosition[] {
  if (positions.some(p => !Number.isInteger(p) || p < 1 || p > 6)) throw new Error('爻位应为 1～6 的整数')
  return [...new Set(positions)].sort((a, b) => a - b) as LinePosition[]
}

export function changeHexagram(id: number, positions: readonly number[]) {
  const original = getHexagram(id)
  const mask = normalizePositions(positions).reduce((result, p) => result | (1 << (p - 1)), 0)
  return fromMask(linesToMask(original.lines) ^ mask)
}

export function lineName(lines: SixLines, position: LinePosition): string {
  const polarity = lines[position - 1] ? '九' : '六'
  return position === 1 ? `初${polarity}` : position === 6 ? `上${polarity}` : `${polarity}${['', '', '二', '三', '四', '五'][position]}`
}

export function selectedPositions(session: CastSession): LinePosition[] {
  return session.mode === 'number' ? [session.fixed] : session.selected
}

export function resultForSession(session: CastSession, requested: readonly number[] = selectedPositions(session)) {
  const selected = normalizePositions(requested)
  if (session.mode === 'number' && (selected.length !== 1 || selected[0] !== session.fixed)) {
    throw new Error('数字模式只能使用由输入确定的固定变爻')
  }
  return changeHexagram(session.hexagramId, selected)
}

// 路由是外部输入；不尝试用默认卦修复错误。
export function parseRoute(query: Record<string, string | undefined>) {
  if (!/^(?:[1-9]|[1-5][0-9]|6[0-4])$/.test(query.id || '')) return undefined
  if (!query.sid || !/^[1-9][0-9]*$/.test(query.sid)) return undefined
  if (!['manual', 'atlas', 'number'].includes(query.mode || '')) return undefined
  if (query.mode === 'number' && !/^[1-6]$/.test(query.fixed || '')) return undefined
  if (query.mode !== 'number' && query.fixed !== undefined) return undefined
  return { id: Number(query.id), sid: query.sid, mode: query.mode, fixed: query.fixed === undefined ? undefined : Number(query.fixed) }
}
