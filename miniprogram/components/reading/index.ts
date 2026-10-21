import { getHexagram } from '../../domain/hexagrams'
import { getTrigram } from '../../domain/trigrams'
import { getContent } from '../../data/repository'

Component({
  properties: { hexagramId: { type: Number, value: 0 } },
  data: { meta: null as ReturnType<typeof getHexagram> | null, content: null as ReturnType<typeof getContent> | null, upperName: '', lowerName: '', statementOpen: true, overviewOpen: true, tuanOpen: false, imageOpen: false, specialOpen: false },
  observers: {
    hexagramId: function(id: number) {
      if (!id) return
      const meta = getHexagram(id)
      this.setData({ meta, content: getContent(id) || null, upperName: getTrigram(meta.upper).name, lowerName: getTrigram(meta.lower).name, statementOpen: true, overviewOpen: true, tuanOpen: false, imageOpen: false, specialOpen: false })
    },
  },
  methods: {
    toggleStatement() { this.setData({ statementOpen: !this.data.statementOpen }) },
    toggleOverview() { this.setData({ overviewOpen: !this.data.overviewOpen }) },
    toggleTuan() { this.setData({ tuanOpen: !this.data.tuanOpen }) },
    toggleImage() { this.setData({ imageOpen: !this.data.imageOpen }) },
    toggleSpecial() { this.setData({ specialOpen: !this.data.specialOpen }) },
  },
})
