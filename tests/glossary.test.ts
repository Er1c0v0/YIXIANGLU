import test from 'node:test'
import assert from 'node:assert/strict'
import { readContent, validateContent } from '../scripts/content-lib.mjs'
import { GLOSSARY_ENTRIES } from '../miniprogram/data/glossary'
import { getContent } from '../miniprogram/data/repository'
import { glossaryNotes, searchGlossary } from '../miniprogram/domain/glossary'
import { annotations } from '../miniprogram/pages/annotations'

test('全部词名及登记写法可查，类别与关键词取交集', () => {
  for (const entry of GLOSSARY_ENTRIES) {
    for (const term of [entry.term, ...entry.aliases, ...entry.usages.map(usage => usage.term)]) {
      assert.ok(searchGlossary(GLOSSARY_ENTRIES, term).some(result => result.id === entry.id), term)
    }
  }
  assert.deepEqual(searchGlossary(GLOSSARY_ENTRIES, '無咎').map(entry => entry.term), ['咎'])
  assert.deepEqual(searchGlossary(GLOSSARY_ENTRIES, '无咎', 'person'), [])
  assert.deepEqual(searchGlossary(GLOSSARY_ENTRIES, '没有这个词'), [])
})

test('注解按语境区分异读、否定、非爻位和特殊词义', () => {
  const notes = (id: number, section: 'statement' | 'tuan' | number) => {
    const content = getContent(id)!
    const block = typeof section === 'number' ? content.yao[section - 1].text : content[section]
    return glossaryNotes(GLOSSARY_ENTRIES, block.glossaryIds || [])
  }
  assert.ok(notes(1, 2).some(note => note.term === '见' && note.pinyin === 'xiàn'))
  assert.ok(notes(1, 2).some(note => note.term === '利见大人' && note.pinyin.includes('jiàn')))
  assert.ok(notes(9, 3).some(note => note.term === '说' && note.pinyin === 'tuō'))
  assert.ok(notes(58, 'tuan').some(note => note.term === '说' && note.pinyin === 'yuè'))
  assert.ok(notes(50, 'tuan').some(note => note.term === '亨' && note.pinyin === 'pēng'))
  assert.ok(notes(6, 'statement').some(note => note.term === '不利涉大川'))
  assert.ok(!notes(6, 'statement').some(note => note.term === '利涉大川'))
  assert.ok(notes(6, 'statement').some(note => note.term === '中吉' && note.explanation.includes('争讼')))
  assert.ok(notes(55, 2).some(note => note.term === '日中' && note.explanation.includes('正午')))
  assert.ok(notes(41, 5).some(note => note.term === '朋' && note.explanation.includes('计量')))
  assert.ok(notes(60, 3).some(note => note.term === '无咎' && note.explanation.includes('归咎他人')))
  assert.ok(notes(60, 6).some(note => note.term === '贞凶' && note.explanation.includes('过度节制')))
  const yao = getContent(1)!.yao[0]
  const combined = glossaryNotes(GLOSSARY_ENTRIES, [...yao.text.glossaryIds!, ...yao.smallImage.glossaryIds!])
  assert.equal(combined.filter(note => note.term === '勿用').length, 1)
})

test('字词构建拒绝悬空关联、失效例句、坏来源与过期释义审核', () => {
  const dataset = readContent()
  const cases = [
    [(d: typeof dataset) => { d.glossary[0].usages[0].occurrences[0].blockId = 'missing' }, /字词关联与正文不符/],
    [(d: typeof dataset) => { d.glossary[0].example.quote = '不存在的例句' }, /字词例句与正文不符/],
    [(d: typeof dataset) => { d.glossary[0].usages[0].refs[0].sourceId = 'missing' }, /来源悬空/],
    [(d: typeof dataset) => { d.glossary[0].explanation += '修改' }, /审核已过期/],
    [(d: typeof dataset) => { d.glossary[0].usages.push(structuredClone(d.glossary[0].usages[0])) }, /用法 ID 重复/],
  ] as const
  for (const [change, message] of cases) {
    const copy = structuredClone(dataset)
    change(copy)
    assert.throws(() => validateContent(copy), message)
  }
  const unreviewed = structuredClone(dataset)
  unreviewed.reviews.find(record => record.id === unreviewed.glossary[0].reviewId).originalStatus = 'pending'
  assert.throws(() => validateContent(unreviewed, { release: true }), /发布查询资料电子核对未完成/)
})

test('注解与目录互斥，关闭动画完成才清空，阅读状态保持', () => {
  const host = {
    ...annotations, data: { ...structuredClone(annotations.data), valid: true, directoryOpen: true, directoryClosing: false, scrollTop: 360, yaoOpen: [true, false] },
    setData(patch: Record<string, unknown>) { Object.assign(this.data, patch) },
  }
  const event = { detail: { ids: getContent(1)!.statement.glossaryIds! } } as any
  host.openAnnotations(event)
  assert.equal(host.data.annotationsOpen, false)
  host.data.directoryOpen = false
  host.openAnnotations(event)
  assert.equal(host.data.annotationsOpen, true)
  const count = host.data.annotationNotes.length
  host.closeAnnotations()
  assert.equal(host.data.annotationNotes.length, count)
  host.openAnnotations(event)
  assert.equal(host.data.annotationsOpen, false)
  host.annotationsLeaving()
  host.annotationsLeft()
  assert.deepEqual(host.data.annotationNotes, [])
  assert.deepEqual([host.data.scrollTop, host.data.yaoOpen], [360, [true, false]])
})
