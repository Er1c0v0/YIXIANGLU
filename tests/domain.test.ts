import test from 'node:test'
import assert from 'node:assert/strict'
import { BASELINE, TRIGRAM_BASELINE } from './fixtures/hexagrams'
import { TRIGRAMS } from '../miniprogram/domain/trigrams'
import { HEXAGRAMS, combine, getHexagram } from '../miniprogram/domain/hexagrams'
import { castNumbers, changeHexagram, lineName, modDecimal, normalizePositiveInteger, normalizePositions, parseRoute, POSITIONS, resultForSession } from '../miniprogram/domain/casting'
import { endSession, isActiveSession, newFlow, readSession, sessionRoute, startSession, updateSelection } from '../miniprogram/state/session'
import type { CastSession, LinePosition } from '../miniprogram/domain/types'

test('64 组合与384爻名：独立六爻基准', () => {
  assert.equal(new Set(BASELINE).size, 64)
  assert.deepEqual(TRIGRAMS.map(t => t.number), [1,2,3,4,5,6,7,8])
  for (const t of TRIGRAMS) assert.equal(t.lines.join(''), TRIGRAM_BASELINE[t.id])
  for (const upper of TRIGRAMS) for (const lower of TRIGRAMS) {
    const result = combine(upper.id, lower.id)
    const expected = TRIGRAM_BASELINE[lower.id] + TRIGRAM_BASELINE[upper.id]
    assert.equal(result.id, BASELINE.indexOf(expected) + 1)
    assert.equal(result.lines.join(''), expected)
  }
  assert.equal(HEXAGRAMS.length, 64)
  const suffix = ['初','二','三','四','五','上']
  BASELINE.forEach((lines, i) => POSITIONS.forEach(p => {
    const polarity = lines[p-1] === '1' ? '九' : '六'
    const expected = p === 1 || p === 6 ? suffix[p-1] + polarity : polarity + suffix[p-1]
    assert.equal(lineName(getHexagram(i+1).lines, p), expected)
  }))
})

test('4096 种变化：数组逐位翻转参照；再次变化复原', () => {
  for (let id = 1; id <= 64; id++) for (let subset = 0; subset < 64; subset++) {
    const positions = POSITIONS.filter((_, i) => Math.floor(subset / 2 ** i) % 2)
    const expected = BASELINE[id - 1].split('').map((line, i) => positions.includes(i + 1 as LinePosition) ? String(1 - Number(line)) : line).join('')
    const result = changeHexagram(id, positions)
    assert.equal(result.id, BASELINE.indexOf(expected) + 1, `${id}/${subset}`)
    assert.equal(result.lines.join(''), expected)
    assert.equal(changeHexagram(result.id, positions).id, id)
  }
  assert.deepEqual(normalizePositions([5,2,2]), [2,5])
  for (const p of [0,7,1.5,NaN]) assert.throws(() => normalizePositions([p]))
  assert.equal(changeHexagram(1, [5,2,2]).id, 30)
})

test('数字边界、1000位及固定变爻关键案例', () => {
  for (const value of ['1','17','00017','  26  ','9007199254740991','9007199254740992','9007199254740993','9'.repeat(1000),'1'+'0'.repeat(999)]) {
    const normalized = normalizePositiveInteger(value)
    for (const divisor of [6,8] as const) assert.equal(modDecimal(normalized,divisor), Number(BigInt(value.trim()) % BigInt(divisor)))
  }
  for (let n=1;n<=48;n++) {
    const cast = castNumbers(String(n),String(n),String(n))
    assert.equal(cast.lower.number,n%8||8)
    assert.equal(cast.upper.number,n%8||8)
    assert.equal(cast.fixed,n%6||6)
  }
  for (const value of ['', ' ', '0','000','-1','+1','1.2','1e3','0x10','17abc','1 2','１２','1\n2']) assert.throws(() => castNumbers(value,'1','1'))
  for (const slot of [0,1,2]) { const values=['1','1','1'];values[slot]='0';assert.throws(()=>castNumbers(...values as [string,string,string])) }
  for (const [values,id,fixed,result] of [[['7','7','5'],52,5,53],[['17','26','9'],43,3,58],[['00017','00026','0009'],43,3,58],[['8','16','6'],2,6,23],[['9007199254740993','8','6'],11,6,26]] as const) {
    const cast=castNumbers(...values)
    assert.equal(cast.hexagram.id,id); assert.equal(cast.fixed,fixed)
    const session:CastSession={mode:'number',hexagramId:id,fixed}
    assert.equal(resultForSession(session).id,result)
    for (const bad of [[],[fixed,1],[fixed===1?2:1]]) assert.throws(()=>resultForSession(session,bad))
  }
})

test('路由、内存会话、返回保留及新流程隔离', () => {
  const session:CastSession={mode:'manual',hexagramId:1,selected:[]}
  const url=startSession(session)
  const query=Object.fromEntries(new URL(url,'https://local').searchParams)
  assert.equal(readSession(query), session)
  updateSelection(session,[5,2]);assert.deepEqual(readSession(query)?.mode==='manual' && session.selected,[2,5])
  assert.ok(sessionRoute('analysis').includes('id=1'))
  for (const patch of [{id:'0'},{id:'65'},{id:'1abc'},{sid:'99999'},{mode:'number'},{fixed:'3'}]) assert.equal(readSession({...query,...patch}),undefined)
  assert.equal(parseRoute({id:'1',mode:'number',sid:'1',fixed:'7'}),undefined)
  assert.throws(()=>startSession({mode:'number',hexagramId:1,fixed:0 as LinePosition}))
  newFlow();assert.equal(readSession(query),undefined)
  startSession({mode:'number',hexagramId:43,fixed:3})
  assert.equal(readSession(query),undefined)
  const fixedQuery=Object.fromEntries(new URL(sessionRoute('changes'),'https://local').searchParams)
  const fixedSession=readSession(fixedQuery)!
  assert.throws(()=>updateSelection(fixedSession,[1]))
  assert.equal(readSession({...fixedQuery,fixed:'2'}),undefined)
})

test('会话按引用归属判断与结束，新流程使旧引用失效', () => {
  newFlow()
  assert.equal(isActiveSession(undefined), false)
  const session:CastSession={mode:'atlas',hexagramId:1,selected:[]}
  startSession(session)
  assert.equal(isActiveSession({...session}), false)
  const replacement:CastSession={...session}
  startSession(replacement)
  assert.equal(isActiveSession(session), false)
  endSession(session)
  endSession(undefined)
  assert.equal(isActiveSession(replacement), true)
  endSession(replacement)
  assert.equal(isActiveSession(replacement), false)
  startSession(session)
  newFlow()
  assert.equal(isActiveSession(session), false)
})
