import { getHexagram } from '../../domain/hexagrams'
import { lineName, resultForSession, selectedPositions } from '../../domain/casting'
import { getContent } from '../../data/repository'
import { isActiveSession, readSession } from '../../state/session'
import { CastSession, SpecialEntry } from '../../domain/types'
Page({
  data: { valid: false, atlasMode: false, original: null as ReturnType<typeof getHexagram>|null, changed: null as ReturnType<typeof getHexagram>|null, selectedNames: '', zero: false, originalSpecials: [] as SpecialEntry[], rows: [] as { position:number; label:string; entry: NonNullable<ReturnType<typeof getContent>>['yao'][number]|null }[] },
  session: undefined as CastSession|undefined,
  onLoad(query:Record<string,string>) {
    const session=readSession(query)
    this.session=session
    if (!session) return
    const original=getHexagram(session.hexagramId)
    const selected=selectedPositions(session)
    const content=getContent(original.id)
    this.setData({ valid:true, atlasMode:session.mode==='atlas', original, changed:resultForSession(session), zero:selected.length===0, originalSpecials:selected.length===6 ? content?.specialEntries || [] : [], selectedNames:selected.map(p=>lineName(original.lines,p)).join('、'), rows:selected.map(position=>({position,label:lineName(original.lines,position),entry:content?.yao[position-1]||null})) })
  },
  onShow() { this.setData({ valid: isActiveSession(this.session) }) },
  back() { wx.navigateBack() },
  home() { wx.switchTab({url:'/pages/home/index'}) },
})
