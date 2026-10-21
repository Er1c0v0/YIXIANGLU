import { getHexagram } from '../../domain/hexagrams'
import { lineName, resultForSession, selectedPositions } from '../../domain/casting'
import { CastSession, LinePosition } from '../../domain/types'
import { readSession, sessionRoute, updateSelection } from '../../state/session'

Page({
  data: { valid: false, original: null as ReturnType<typeof getHexagram>|null, changed: null as ReturnType<typeof getHexagram>|null, selected: [] as LinePosition[], selectedNames: '', numberMode: false, busy: false },
  session: undefined as CastSession|undefined,
  onLoad(query: Record<string,string>) {
    this.session = readSession(query)
    if (this.session) this.refresh()
  },
  onShow() { this.setData({ busy: false }) },
  refresh() {
    const session = this.session!
    const selected = selectedPositions(session)
    const original = getHexagram(session.hexagramId)
    this.setData({ valid: true, original, numberMode: session.mode === 'number', selected: [...selected], selectedNames: selected.map(p => lineName(original.lines,p)).join('、'), changed: resultForSession(session) })
  },
  choose(e: WechatMiniprogram.CustomEvent<{position: LinePosition}>) {
    if (!this.session || this.session.mode === 'number') return
    const p = e.detail.position
    const selected = this.session.selected.includes(p) ? this.session.selected.filter(item => item !== p) : [...this.session.selected,p]
    updateSelection(this.session,selected)
    this.refresh()
  },
  clear() { if (this.session) { updateSelection(this.session,[]); this.refresh() } },
  modifyNumbers() { wx.navigateBack({ delta: 2 }) },
  confirm() {
    if (this.data.busy) return
    this.setData({ busy: true })
    wx.navigateTo({ url: sessionRoute('analysis'), fail: () => this.setData({ busy: false }) })
  },
  home() { wx.switchTab({ url: '/pages/home/index' }) },
})
