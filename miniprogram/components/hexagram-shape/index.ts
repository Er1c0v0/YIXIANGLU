import { lineName } from '../../domain/casting'
import { SixLines } from '../../domain/types'

Component({
  properties: {
    lines: { type: Array, value: [] },
    selected: { type: Array, value: [] },
    interactive: { type: Boolean, value: false },
    showLabels: { type: Boolean, value: false },
    compact: { type: Boolean, value: false },
  },
  data: { rows: [] as { position: number; yang: boolean; label: string; active: boolean }[] },
  observers: {
    'lines, selected': function(lines: number[], selected: number[]) {
      const rows = lines.map((yang, i) => ({ position: i+1, yang: yang === 1, label: lines.length === 6 ? lineName(lines as unknown as SixLines, (i+1) as 1|2|3|4|5|6) : '', active: selected.includes(i+1) })).reverse()
      this.setData({ rows })
    },
  },
  methods: {
    choose(e: WechatMiniprogram.TouchEvent) {
      if (this.data.interactive) this.triggerEvent('select', { position: e.currentTarget.dataset.position })
    },
  },
})
