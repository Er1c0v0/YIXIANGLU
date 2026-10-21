import { readSession, sessionRoute } from '../../state/session'
Page({
  data: { valid: false, id: 0, numberMode: false, busy: false },
  onLoad(query: Record<string,string>) {
    const session = readSession(query)
    this.setData({ valid: !!session, id: session?.hexagramId || 0, numberMode: session?.mode === 'number' })
  },
  onShow() { this.setData({ busy: false }) },
  next() {
    if (this.data.busy) return
    this.setData({ busy: true })
    wx.navigateTo({ url: sessionRoute('changes'), fail: () => this.setData({ busy: false }) })
  },
  home() { wx.switchTab({ url: '/pages/home/index' }) },
})
