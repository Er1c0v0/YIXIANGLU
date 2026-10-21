import { castNumbers, normalizePositiveInteger } from '../../domain/casting'
import { newFlow, startSession } from '../../state/session'

Page({
  data: {
    fields: [{ label: '① 下卦数', value: '', error: '' }, { label: '② 上卦数', value: '', error: '' }, { label: '③ 变爻数', value: '', error: '' }],
    valid: false, busy: false, focusedIndex: -1,
  },
  onLoad() { newFlow() },
  onShow() { this.setData({ busy: false }) },
  focus(e: WechatMiniprogram.InputFocus) { this.setData({ focusedIndex: Number(e.currentTarget.dataset.index) }) },
  blur() { this.setData({ focusedIndex: -1 }) },
  input(e: WechatMiniprogram.Input) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({ [`fields[${index}].value`]: e.detail.value })
    newFlow()
    this.validate()
  },
  validate(showEmpty = false) {
    const fields = this.data.fields.map(field => {
      let error = ''
      if (field.value !== '' || showEmpty) {
        try {
          normalizePositiveInteger(field.value)
        } catch (err) { error = (err as Error).message }
      }
      return { ...field, error }
    })
    this.setData({ fields, valid: fields.every(field => field.value.trim() && !field.error) })
  },
  generate() {
    this.validate(true)
    if (!this.data.valid || this.data.busy) return
    this.setData({ busy: true })
    const values = this.data.fields.map(field => field.value) as [string,string,string]
    const { hexagram, fixed } = castNumbers(...values)
    const url = startSession({ mode: 'number', hexagramId: hexagram.id, fixed, rawInputs: values })
    wx.navigateTo({ url, fail: () => this.setData({ busy: false }) })
  },
})
