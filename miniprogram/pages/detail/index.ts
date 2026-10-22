import { HEXAGRAMS, getHexagram } from '../../domain/hexagrams'
import { getContent } from '../../data/repository'
import { CastSession, HexagramMeta } from '../../domain/types'
import { endSession, isActiveSession, sessionRoute, startSession } from '../../state/session'
import { endReading, readReading, ReadingContext } from '../../state/reading'

Page({
  data: {
    valid: false, id: 0, showAtlasLink: true, busy: false, error: '未找到该卦',
    filtered: false, previous: null as HexagramMeta | null, next: null as HexagramMeta | null,
    directoryOpen: false, directoryClosing: false,
    sections: [{ id: 'statement', label: '卦辞' }, { id: 'overview', label: '意象与整体含义' }, { id: 'tuan', label: '彖传' }, { id: 'image', label: '大象传' }],
    yaoItems: [] as { id: string; label: string }[], specialLabel: '',
  },
  observation: undefined as CastSession | undefined,
  context: undefined as ReadingContext | undefined,
  ids: [] as readonly number[],
  pendingSection: '',
  onLoad(query: Record<string, string>) {
    if (!/^(?:[1-9]|[1-5][0-9]|6[0-4])$/.test(query.id || '')) return
    const id = Number(query.id)
    if (query.reading !== undefined) {
      this.context = readReading(query.reading, id)
      if (!this.context) { this.expire(); return }
    }
    this.ids = this.context ? this.context.ids : HEXAGRAMS.map(item => item.id)
    const pages = getCurrentPages()
    this.setData({ valid: true, filtered: this.context?.filtered || false, showAtlasLink: pages[pages.length - 2]?.route !== 'pages/atlas/index' })
    this.showHexagram(id)
  },
  onShow() {
    this.setData({ busy: false })
    if (this.context && readReading(this.context.key, this.data.id) !== this.context) this.expire()
  },
  onUnload() { endSession(this.observation); endReading(this.context) },
  expire() {
    this.pendingSection = ''
    endSession(this.observation)
    this.setData({ valid: false, directoryOpen: false, error: '本次查阅已失效，请返回图鉴' })
  },
  showHexagram(id: number, done?: () => void) {
    const meta = getHexagram(id)
    const index = this.ids.indexOf(id)
    this.setData({
      id, previous: index > 0 ? getHexagram(this.ids[index - 1]) : null,
      next: index < this.ids.length - 1 ? getHexagram(this.ids[index + 1]) : null,
      yaoItems: getContent(id)!.yao.map(item => ({ id: `yao-${item.position}`, label: item.label })),
      specialLabel: id === 1 ? '用九' : id === 2 ? '用六' : '', directoryOpen: false,
    }, done)
    wx.setNavigationBarTitle({ title: meta.fullName })
  },
  switchHexagram(e: WechatMiniprogram.TouchEvent) {
    if (!this.data.valid || this.data.busy || this.data.directoryOpen || this.data.directoryClosing) return
    const direction = Number(e.currentTarget.dataset.direction)
    if (direction !== -1 && direction !== 1) return
    const target = direction === -1 ? this.data.previous : this.data.next
    if (!target) return
    this.setData({ busy: true })
    this.pendingSection = ''
    endSession(this.observation)
    this.observation = undefined
    this.showHexagram(target.id, () => {
      wx.pageScrollTo({ scrollTop: 0, duration: 0, complete: () => this.setData({ busy: false }) })
    })
  },
  openDirectory() {
    if (!this.data.valid || this.data.busy || this.data.directoryClosing) return
    this.pendingSection = ''
    this.setData({ directoryOpen: true })
  },
  closeDirectory() {
    this.pendingSection = ''
    this.setData({ directoryOpen: false, directoryClosing: true })
  },
  chooseSection(e: WechatMiniprogram.TouchEvent) {
    if (!this.data.directoryOpen) return
    this.pendingSection = e.currentTarget.dataset.section
    this.setData({ directoryOpen: false, directoryClosing: true })
  },
  directoryLeaving() { this.setData({ directoryOpen: false, directoryClosing: true }) },
  directoryLeft() {
    const target = this.pendingSection
    this.pendingSection = ''
    this.setData({ directoryOpen: false, directoryClosing: false }, () => {
      if (!target || !this.data.valid) return
      this.selectComponent('#reading').reveal(target, (top: number) => {
        const query = this.createSelectorQuery()
        query.select('#directory-bar').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(result => {
          wx.pageScrollTo({ scrollTop: Math.max(0, top + result[1].scrollTop - result[0].height), duration: 0 })
        })
      })
    })
  },
  observe() {
    if (!this.data.valid || this.data.busy || this.data.directoryOpen || this.data.directoryClosing) return
    this.setData({ busy: true })
    if (!isActiveSession(this.observation)) {
      this.observation = { mode: 'atlas', hexagramId: this.data.id, selected: [] }
      startSession(this.observation)
    }
    wx.navigateTo({ url: sessionRoute('changes'), fail: () => this.setData({ busy: false }) })
  },
  atlas() { wx.switchTab({ url: '/pages/atlas/index' }) },
})
