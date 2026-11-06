import { GLOSSARY_ENTRIES } from '../../data/glossary'
import { GLOSSARY_CATEGORIES, searchGlossary } from '../../domain/glossary'
import { GlossaryEntry } from '../../domain/types'

const categories = [{ id: '', name: '全部类别' }, ...GLOSSARY_CATEGORIES]
const displayEntries = GLOSSARY_ENTRIES.map(entry => ({
  ...entry,
  usages: entry.usages.filter(usage => usage.term !== entry.term || usage.pinyin !== entry.pinyin || usage.explanation !== entry.explanation),
  refs: [...new Map([...entry.refs, ...entry.usages.flatMap(usage => usage.refs)].map(ref => [`${ref.sourceId}:${ref.locator}`, ref])).values()],
}))
const groups = (entries: readonly GlossaryEntry[]) => GLOSSARY_CATEGORIES.map(category => ({
  ...category, entries: entries.filter(entry => entry.category === category.id),
})).filter(group => group.entries.length)

Page({
  data: { categories, categoryIndex: 0, groups: groups(displayEntries), inputValue: '', hasText: false, expandedId: '' },
  keyword: '',
  input(e: WechatMiniprogram.Input) { this.keyword = e.detail.value; this.refresh() },
  refresh() {
    this.setData({
      groups: groups(searchGlossary(displayEntries, this.keyword, categories[this.data.categoryIndex].id)),
      hasText: !!this.keyword, expandedId: '',
    })
  },
  filter(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value)
    if (!Number.isInteger(index) || index < 0 || index >= categories.length) return
    this.setData({ categoryIndex: index })
    this.refresh()
  },
  clearSearch() { this.keyword = ''; this.setData({ inputValue: '' }); this.refresh() },
  toggle(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    this.setData({ expandedId: this.data.expandedId === id ? '' : id })
  },
})
