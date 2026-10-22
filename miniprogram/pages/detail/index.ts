import { getHexagram } from '../../domain/hexagrams'
import { CastSession } from '../../domain/types'
import { endSession, isActiveSession, sessionRoute, startSession } from '../../state/session'

Page({
  data: { valid: false, id: 0, showAtlasLink: true, busy: false },
  observation: undefined as CastSession | undefined,
  onLoad(query: Record<string, string>) {
    if (!/^(?:[1-9]|[1-5][0-9]|6[0-4])$/.test(query.id || '')) return
    const meta = getHexagram(Number(query.id))
    const pages = getCurrentPages()
    this.setData({ valid: true, id: meta.id, showAtlasLink: pages[pages.length - 2]?.route !== 'pages/atlas/index' })
    wx.setNavigationBarTitle({ title: meta.fullName })
  },
  onShow() { this.setData({ busy: false }) },
  onUnload() { endSession(this.observation) },
  observe() {
    if (!this.data.valid || this.data.busy) return
    this.setData({ busy: true })
    if (!isActiveSession(this.observation)) {
      this.observation = { mode: 'atlas', hexagramId: this.data.id, selected: [] }
      startSession(this.observation)
    }
    wx.navigateTo({ url: sessionRoute('changes'), fail: () => this.setData({ busy: false }) })
  },
  atlas() { wx.switchTab({ url: '/pages/atlas/index' }) },
})
