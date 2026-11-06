import { GLOSSARY_ENTRIES } from '../data/glossary'
import { glossaryNotes } from '../domain/glossary'
import { GlossaryUsage } from '../domain/types'

interface AnnotationHost {
  data: { valid: boolean; busy?: boolean; directoryOpen?: boolean; directoryClosing?: boolean; annotationsOpen: boolean; annotationsClosing: boolean }
  setData(data: Record<string, unknown>): void
}

// 三个阅读页面共用一份浮层状态；不建立查阅或观变会话。
export const annotations = {
  data: { annotationsOpen: false, annotationsClosing: false, annotationNotes: [] as GlossaryUsage[] },
  openAnnotations(this: AnnotationHost, e: WechatMiniprogram.CustomEvent<{ ids: string[] }>) {
    if (!this.data.valid || this.data.busy || this.data.directoryOpen || this.data.directoryClosing || this.data.annotationsOpen || this.data.annotationsClosing) return
    const notes = glossaryNotes(GLOSSARY_ENTRIES, e.detail.ids)
    if (notes.length) this.setData({ annotationNotes: notes, annotationsOpen: true })
  },
  closeAnnotations(this: AnnotationHost) { this.setData({ annotationsOpen: false, annotationsClosing: true }) },
  annotationsLeaving(this: AnnotationHost) { this.setData({ annotationsOpen: false, annotationsClosing: true }) },
  annotationsLeft(this: AnnotationHost) { this.setData({ annotationsClosing: false, annotationNotes: [] }) },
}
