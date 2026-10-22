import { TRIGRAMS } from '../../domain/trigrams'
import { ImageryEntry, TrigramId } from '../../domain/types'
import { IMAGERY, ELEMENT_RELATIONS } from '../../data/trigrams'

const categories: { id: ImageryEntry['category'] | 'relations' | ''; name: string }[] = [
  { id: '', name: '全部' }, { id: 'quality', name: '卦性' }, { id: 'nature', name: '自然' },
  { id: 'family', name: '人伦' }, { id: 'animal', name: '动物' }, { id: 'body', name: '身体' },
  { id: 'later-direction', name: '后天方位' }, { id: 'gate', name: '八门' }, { id: 'season', name: '季节' },
  { id: 'element', name: '五行' },
  { id: 'color', name: '颜色' }, { id: 'relations', name: '五行生克' },
]
const elements = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' }
function groupsFor(trigram: TrigramId, categoryIndex: number) {
  const selected = categories[categoryIndex].id
  return categories.slice(1).filter(c => !selected || c.id === selected).map(category => ({
    id: category.id, title: category.name,
    value: [...new Set(IMAGERY.filter(e => e.trigram === trigram && e.category === category.id)
      .flatMap(e => e.values))].join('、'),
  }))
}
function relationsFor(trigram: TrigramId) {
  const element = IMAGERY.find(e => e.trigram === trigram && e.category === 'element')!.values[0]
  return (['generates', 'controls'] as const).map(relation => ({
    id: relation, title: relation === 'generates' ? '相生' : '相克',
    entries: ELEMENT_RELATIONS.filter(e => e.relation === relation && (elements[e.from] === element || elements[e.to] === element))
      .map(e => ({ id: e.id, text: `${elements[e.from]} → ${elements[e.to]}` })),
  }))
}
Page({
  data: { trigrams: TRIGRAMS, selected: 'qian' as TrigramId, categories, categoryIndex: 0, groups: groupsFor('qian', 0), relations: relationsFor('qian') },
  choose(e: WechatMiniprogram.TouchEvent) {
    const trigram = TRIGRAMS.find(t => t.id === e.currentTarget.dataset.id)
    if (!trigram) return
    this.setData({ selected: trigram.id, groups: groupsFor(trigram.id, this.data.categoryIndex), relations: relationsFor(trigram.id) })
  },
  filter(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value)
    if (!Number.isInteger(index) || index < 0 || index >= categories.length) return
    this.setData({ categoryIndex: index, groups: groupsFor(this.data.selected, index) })
  },
})
