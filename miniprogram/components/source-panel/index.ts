import { SOURCES } from '../../data/sources'
import { SourceRef } from '../../domain/types'

Component({
  properties: { refs: { type: Array, value: [] }, relatedRefs: { type: Array, value: [] } },
  data: { open: false, sources: [] as { key: string; title: string; locator: string; url?: string; edition: string; rightsNote: string; note?: string }[] },
  observers: {
    'refs, relatedRefs': function(refs: SourceRef[], relatedRefs: SourceRef[]) {
      this.setData({ sources: [...refs, ...relatedRefs].map(ref => {
        const source = SOURCES.find(item => item.id === ref.sourceId)!
        return { key: `${ref.sourceId}:${ref.locator}`, title: source.title, locator: ref.locator, url: source.url, edition: source.edition, rightsNote: source.rightsNote, note: ref.note }
      }) })
    },
  },
  methods: {
    toggle() { this.setData({ open: !this.data.open }) },
    copy(e: WechatMiniprogram.TouchEvent) { wx.setClipboardData({ data: e.currentTarget.dataset.url }) },
  },
})
