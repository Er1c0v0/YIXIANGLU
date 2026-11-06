import { GlossaryEntry, GlossaryUsage } from './types'

export const GLOSSARY_CATEGORIES = [
  { id: 'core', name: '核心词' }, { id: 'outcome', name: '吉凶与处境' },
  { id: 'expression', name: '常见表达' }, { id: 'person', name: '人物称谓' },
  { id: 'reading', name: '易误读或误解' }, { id: 'structure', name: '彖象术语' },
] as const

export function searchGlossary(entries: readonly GlossaryEntry[], keyword: string, category = '') {
  const query = keyword.trim()
  return entries.filter(entry => (!category || entry.category === category) && (!query ||
    [entry.term, ...entry.aliases, ...entry.usages.map(usage => usage.term)].some(term => term.includes(query))))
}

export function glossaryNotes(entries: readonly GlossaryEntry[], ids: readonly string[]): GlossaryUsage[] {
  const usages = new Map(entries.flatMap(entry => entry.usages.map(usage => [usage.id, usage] as const)))
  return [...new Set(ids)].map(id => usages.get(id)!).filter(Boolean)
}
