import { SOURCES } from '../../data/content'
import { SourceRef } from '../../domain/types'

Component({
  properties: { refs: { type: Array, value: [] } },
  data: { open: false, sources: [] as { title: string; edition: string; locator: string; url: string; rightsNote: string }[] },
  observers: {
    refs: function(refs: SourceRef[]) {
      this.setData({ sources: refs.map(ref => {
        const source = SOURCES.find(item => item.id === ref.sourceId)!
        return { title: source.title, edition: source.edition, locator: ref.locator, url: source.url || '', rightsNote: source.rightsNote }
      }) })
    },
  },
  methods: { toggle() { this.setData({ open: !this.data.open }) } },
})
