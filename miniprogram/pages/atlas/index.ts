import { HEXAGRAMS, getHexagram } from '../../domain/hexagrams'
import { TRIGRAMS, getTrigram } from '../../domain/trigrams'
import { searchHexagrams, normalizeSearch } from '../../domain/search'
import { SEARCH_ENTRIES } from '../../data/search'
import { endReading, startReading } from '../../state/reading'

const options = [{ id: '', name: '不限' }, ...TRIGRAMS]
const card = (id: number) => {
  const meta = getHexagram(id)
  return { ...meta, upperName: getTrigram(meta.upper).name, lowerName: getTrigram(meta.lower).name }
}
Page({
  data: {
    samples: HEXAGRAMS.map(item => card(item.id)), busy: false,
    options, upperIndex: 0, lowerIndex: 0, inputValue: '', hasText: false, active: false,
  },
  keyword: '',
  timer: 0,
  scrollTop: 0,
  onShow() {
    this.setData({ busy: false }, () => {
      if (this.scrollTop) wx.pageScrollTo({ scrollTop: this.scrollTop, duration: 0 })
    })
  },
  onPageScroll(e: WechatMiniprogram.Page.IPageScrollOption) { this.scrollTop = e.scrollTop },
  onHide() { if (this.timer !== 0) this.refresh() },
  onUnload() { clearTimeout(this.timer) },
  input(e: WechatMiniprogram.Input) {
    this.keyword = e.detail.value
    // 不回写 value，也不返回替换文本，避免打断输入法组词。
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.refresh(), 150)
  },
  refresh() {
    clearTimeout(this.timer)
    this.timer = 0
    const upper = TRIGRAMS[this.data.upperIndex - 1]?.id
    const lower = TRIGRAMS[this.data.lowerIndex - 1]?.id
    const ids = searchHexagrams(SEARCH_ENTRIES, this.keyword, upper, lower)
    this.setData({ samples: ids.map(card), hasText: !!this.keyword, active: !!normalizeSearch(this.keyword) || !!upper || !!lower })
  },
  filter(e: WechatMiniprogram.PickerChange) {
    const index = Number(e.detail.value)
    if (!Number.isInteger(index) || index < 0 || index >= options.length) return
    if (e.currentTarget.dataset.side === 'upper') this.setData({ upperIndex: index })
    else this.setData({ lowerIndex: index })
    this.refresh()
  },
  clearSearch() { this.keyword = ''; this.setData({ inputValue: '' }); this.refresh() },
  reset() {
    this.keyword = ''
    this.setData({ inputValue: '', upperIndex: 0, lowerIndex: 0 })
    this.refresh()
  },
  read(e: WechatMiniprogram.TouchEvent) {
    if (this.data.busy) return
    if (this.timer !== 0) this.refresh()
    const id = Number(e.currentTarget.dataset.id)
    if (!this.data.samples.some(item => item.id === id)) return
    const context = startReading(this.data.samples.map(item => item.id), this.data.active)
    this.setData({ busy: true })
    wx.navigateTo({
      url: `/pages/detail/index?id=${id}&reading=${context.key}`,
      fail: () => { endReading(context); this.setData({ busy: false }) },
    })
  },
})
