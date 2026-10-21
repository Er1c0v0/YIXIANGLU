import { startSession } from '../../state/session'
import { getHexagram } from '../../domain/hexagrams'
Page({
  data: { samples: [1,2,30,43,58].map(getHexagram), busy: false },
  onShow() { this.setData({busy:false}) },
  read(e:WechatMiniprogram.TouchEvent) {
    if(this.data.busy) return
    this.setData({busy:true})
    const url=startSession({mode:'atlas',hexagramId:Number(e.currentTarget.dataset.id),selected:[]})
    wx.navigateTo({url,fail:()=>this.setData({busy:false})})
  },
})
