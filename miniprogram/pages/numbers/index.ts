import { castNumbers, modDecimal, normalizePositiveInteger } from '../../domain/casting'
import { newFlow, startSession } from '../../state/session'

Page({
  data: {
    fields: [{ label: '① 下卦数', divisor: 8, value: '', error: '', hint: '' }, { label: '② 上卦数', divisor: 8, value: '', error: '', hint: '' }, { label: '③ 变爻数', divisor: 6, value: '', error: '', hint: '' }],
    valid: false, busy: false,
  },
  onLoad() { newFlow() },
  onShow() { this.setData({ busy: false }) },
  input(e: WechatMiniprogram.Input) {
    const index = Number(e.currentTarget.dataset.index)
    this.setData({ [`fields[${index}].value`]: e.detail.value })
    newFlow()
    this.validate()
  },
  validate(showEmpty = false) {
    const fields = this.data.fields.map(field => {
      let error = '', hint = ''
      if (field.value !== '' || showEmpty) {
        try {
          const value = normalizePositiveInteger(field.value)
          const remainder = modDecimal(value, field.divisor as 6|8)
          hint = `除以 ${field.divisor} 余 ${remainder}${remainder === 0 ? `，按 ${field.divisor} 计` : ''}`
        } catch (err) { error = (err as Error).message }
      }
      return { ...field, error, hint }
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
