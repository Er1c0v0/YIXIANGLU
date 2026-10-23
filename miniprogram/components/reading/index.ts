import { getHexagram } from '../../domain/hexagrams'
import { getTrigram } from '../../domain/trigrams'
import { getContent } from '../../data/repository'

Component({
  options: { multipleSlots: true },
  properties: { hexagramId: { type: Number, value: 0 }, showYao: { type: Boolean, value: false } },
  data: { meta: null as ReturnType<typeof getHexagram> | null, content: null as ReturnType<typeof getContent> | null, upperName: '', lowerName: '', overviewText: '', statementOpen: true, overviewOpen: true, tuanOpen: false, imageOpen: false, specialOpen: false, yaoOpen: [false, false, false, false, false, false] },
  observers: {
    hexagramId: function(id: number) {
      if (!id) return
      const meta = getHexagram(id)
      const content = getContent(id) || null
      this.setData({ meta, content, overviewText: content ? [...content.imagery, content.overallMeaning].join('\n\n') : '', upperName: getTrigram(meta.upper).name, lowerName: getTrigram(meta.lower).name, statementOpen: true, overviewOpen: true, tuanOpen: false, imageOpen: false, specialOpen: false, yaoOpen: [false, false, false, false, false, false] })
    },
  },
  methods: {
    toggleStatement() { this.setData({ statementOpen: !this.data.statementOpen }) },
    toggleOverview() { this.setData({ overviewOpen: !this.data.overviewOpen }) },
    toggleTuan() { this.setData({ tuanOpen: !this.data.tuanOpen }) },
    toggleImage() { this.setData({ imageOpen: !this.data.imageOpen }) },
    toggleSpecial() { this.setData({ specialOpen: !this.data.specialOpen }) },
    toggleYao(e: WechatMiniprogram.TouchEvent) {
      const index = e.currentTarget.dataset.index
      this.setData({ [`yaoOpen[${index}]`]: !this.data.yaoOpen[index] })
    },
    reveal(target: string, done: (top: number) => void) {
      const fields: Record<string, string> = { statement: 'statementOpen', overview: 'overviewOpen', tuan: 'tuanOpen', image: 'imageOpen', special: 'specialOpen' }
      const field = target.startsWith('yao-') ? `yaoOpen[${Number(target.slice(4)) - 1}]` : fields[target]
      this.setData(field ? { [field]: true } : {}, () => {
        this.createSelectorQuery().select(`#section-${target}`).boundingClientRect(rect => {
          done((rect as WechatMiniprogram.BoundingClientRectCallbackResult).top)
        }).exec()
      })
    },
  },
})
