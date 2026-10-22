import { HexagramSearchEntry, TrigramId } from './types'

// 只规范化匹配值；页面输入框始终保留用户正在输入的文字。
export function normalizeSearch(value: string): string {
  return value.normalize('NFKC').toLowerCase().normalize('NFD')
    .replace(/u\u0308/g, 'v').replace(/[\u0300-\u036f]/g, '')
    .replace(/u:/g, 'v').replace(/[\s'’·-]/g, '')
}

export function searchHexagrams(
  entries: readonly HexagramSearchEntry[], keyword: string,
  upper?: TrigramId, lower?: TrigramId,
): number[] {
  const query = normalizeSearch(keyword)
  const numeric = /^\d+$/.test(keyword.normalize('NFKC').trim())
  return entries.filter(entry => {
    if ((upper && entry.upper !== upper) || (lower && entry.lower !== lower)) return false
    if (!query) return true
    if (numeric) return entry.id === Number(query)
    return [entry.name, entry.fullName, ...entry.traditionalNames,
      ...entry.aliases.map(alias => alias.value), entry.pinyin, entry.fullNamePinyin,
      ...entry.pinyinInitials].some(term => normalizeSearch(term).includes(query))
  }).map(entry => entry.id).sort((a, b) => a - b)
}
