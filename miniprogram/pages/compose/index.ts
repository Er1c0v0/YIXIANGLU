import { TRIGRAMS, getTrigram } from '../../domain/trigrams'
import { combine } from '../../domain/hexagrams'
import { HexagramMeta, TrigramId } from '../../domain/types'
import { newFlow, startSession } from '../../state/session'

type Slot = 'upper' | 'lower'
type Card = { id: string; name: string; lines: readonly number[]; x: number; y: number; key: string }
Page({
  data: { upper: '', lower: '', upperName: '', lowerName: '', upperLines: [] as readonly number[], lowerLines: [] as readonly number[], preview: null as HexagramMeta | null, cards: [] as Card[], cardWidth: 0, cardHeight: 0, boardHeight: 0, dragging: false, busy: false },
  dragStart: { x: 0, y: 0 },
  dragId: '',
  moved: false,
  tapBlockedUntil: 0,
  revision: 0,
  onLoad() { newFlow() },
  onReady() { this.resetCards() },
  onShow() { this.setData({ busy: false }) },
  onResize() { this.setData({ dragging: false }); this.resetCards() },
  resetCards() {
    const scale = wx.getWindowInfo().windowWidth / 750
    const fontSize = wx.getAppBaseInfo().fontSizeSetting
    this.createSelectorQuery().select('.board-content').boundingClientRect(result => {
      const rect = result as WechatMiniprogram.BoundingClientRectCallbackResult
      const cardWidth = (rect.width - 3 * 12 * scale) / 4
      // 卦形与留白使用rpx，文字高度跟随0.875rem字号和1.7行高。
      const cardHeight = Math.max(136 * scale, 80 * scale + fontSize * 0.875 * 1.7)
      const startY = rect.height + 20 * scale
      this.revision++
      this.setData({ cardWidth, cardHeight, boardHeight: startY + cardHeight * 2 + 40 * scale, cards: TRIGRAMS.map((t, i) => ({ ...t, x: (i%4)*(cardWidth+12*scale), y: startY+Math.floor(i/4)*(cardHeight+16*scale), key: `${this.revision}-${t.id}` })) })
    }).exec()
  },
  setSlot(slot: Slot, id: TrigramId) {
    newFlow()
    this.setData({ [slot]: id })
    this.refresh()
  },
  refresh() {
    const upper = this.data.upper ? getTrigram(this.data.upper) : null
    const lower = this.data.lower ? getTrigram(this.data.lower) : null
    this.setData({ upperName: upper?.name || '', lowerName: lower?.name || '', upperLines: upper?.lines || [], lowerLines: lower?.lines || [], preview: upper && lower ? combine(upper.id, lower.id) : null }, () => this.resetCards())
  },
  pick(e: WechatMiniprogram.TouchEvent) {
    if (Date.now() < this.tapBlockedUntil) return
    const id = e.currentTarget.dataset.id as TrigramId
    wx.showActionSheet({ itemList: ['放入上卦', '放入下卦'], success: result => this.setSlot(result.tapIndex === 0 ? 'upper' : 'lower', id) })
  },
  touchStart(e: WechatMiniprogram.TouchEvent) {
    const touch = e.touches[0]
    this.dragStart = { x: touch.clientX, y: touch.clientY }
    this.dragId = e.currentTarget.dataset.id
    this.moved = false
  },
  moveCard(e: WechatMiniprogram.CustomEvent<{source: string}>) {
    if (this.dragId && e.detail.source === 'touch' && !this.moved) { this.moved = true; this.setData({ dragging: true }) }
  },
  touchEnd(e: WechatMiniprogram.TouchEvent) {
    const touch = e.changedTouches[0]
    const moved = Math.hypot(touch.clientX-this.dragStart.x, touch.clientY-this.dragStart.y) > 8
    const id = this.dragId as TrigramId
    this.dragId = ''
    this.setData({ dragging: false })
    if (moved) {
      this.tapBlockedUntil = Date.now() + 350
      this.createSelectorQuery().selectAll('.drop-slot').boundingClientRect(rects => {
        const slots = rects as unknown as WechatMiniprogram.BoundingClientRectCallbackResult[]
        const index = slots.findIndex(rect => touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom)
        if (index >= 0) this.setSlot(index === 0 ? 'upper' : 'lower', id)
        else this.resetCards()
      }).exec()
    } else this.resetCards()
  },
  touchCancel() { this.dragId = ''; this.tapBlockedUntil = Date.now() + 350; this.setData({ dragging: false }); this.resetCards() },
  swap() { newFlow(); const { upper, lower } = this.data; this.setData({ upper: lower, lower: upper }); this.refresh() },
  clear() { newFlow(); this.setData({ upper: '', lower: '' }); this.refresh() },
  generate() {
    if (!this.data.preview || this.data.busy) return
    this.setData({ busy: true })
    const url = startSession({ mode: 'manual', hexagramId: this.data.preview.id, selected: [] })
    wx.navigateTo({ url, fail: () => this.setData({ busy: false }) })
  },
})
