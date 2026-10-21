import { SOURCES } from '../../data/content'
import { SourceRef } from '../../domain/types'

Component({
  properties: { refs: { type: Array, value: [] } },
  data: { open: false, sources: [] as { title: string; locator: string; url: string; revision: string }[] },
  observers: {
    refs: function(refs: SourceRef[]) {
      this.setData({ sources: refs.map(ref => {
        const source = SOURCES.find(item => item.id === ref.sourceId)!
        return { title: source.title, locator: ref.locator, url: source.url || '', revision: source.revisionOrSnapshot || '' }
      }) })
    },
  },
  methods: {
    toggle() { this.setData({ open: !this.data.open }) },
    copy(e: WechatMiniprogram.TouchEvent) { wx.setClipboardData({ data: e.currentTarget.dataset.url }) },
  },
})
