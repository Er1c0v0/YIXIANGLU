import { annotations } from '../annotations'
import { CastSession } from '../../domain/types'
import { isActiveSession, readSession, sessionRoute } from '../../state/session'
Page({
  ...annotations,
  data: { ...annotations.data, valid: false, id: 0, numberMode: false, busy: false },
  session: undefined as CastSession|undefined,
  onLoad(query: Record<string,string>) {
    const session = readSession(query)
    this.session = session
    this.setData({ valid: !!session, id: session?.hexagramId || 0, numberMode: session?.mode === 'number' })
  },
  onShow() { this.setData({ ...(!isActiveSession(this.session) ? annotations.data : {}), valid: isActiveSession(this.session), busy: false }) },
  next() {
    if (!this.data.valid || this.data.busy || this.data.annotationsOpen || this.data.annotationsClosing) return
    this.setData({ busy: true })
    wx.navigateTo({ url: sessionRoute('changes'), fail: () => this.setData({ busy: false }) })
  },
  home() { wx.switchTab({ url: '/pages/home/index' }) },
})
