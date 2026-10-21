import { newFlow } from '../../state/session'
Page({
  data: { busy: false, heroLines: [1,0,1,1,0,1] },
  onShow() { this.setData({ busy: false }) },
  begin(e: WechatMiniprogram.TouchEvent) {
    if (this.data.busy) return
    this.setData({ busy: true })
    newFlow()
    wx.navigateTo({ url: `/pages/${e.currentTarget.dataset.page}/index`, fail: () => this.setData({ busy: false }) })
  },
})
