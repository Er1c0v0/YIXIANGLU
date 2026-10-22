import { startSession } from '../../state/session'
import { getCollectedHexagrams } from '../../data/repository'
Page({
  data: { samples: getCollectedHexagrams(), busy: false },
  onShow() { this.setData({busy:false}) },
  read(e:WechatMiniprogram.TouchEvent) {
    if(this.data.busy) return
    this.setData({busy:true})
    const url=startSession({mode:'atlas',hexagramId:Number(e.currentTarget.dataset.id),selected:[]})
    wx.navigateTo({url,fail:()=>this.setData({busy:false})})
  },
})
