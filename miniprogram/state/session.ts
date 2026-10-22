import { CastSession, LinePosition } from '../domain/types'
import { parseRoute, normalizePositions, resultForSession } from '../domain/casting'
import { getHexagram } from '../domain/hexagrams'

let serial = 0
let active: { sid: string; session: CastSession } | undefined

export function newFlow() { active = undefined }

export function startSession(session: CastSession): string {
  getHexagram(session.hexagramId)
  if (session.mode === 'number') {
    if (!Number.isInteger(session.fixed) || session.fixed < 1 || session.fixed > 6) throw new Error('无效的固定爻位')
  } else {
    session.selected = normalizePositions(session.selected)
  }
  active = { sid: String(++serial), session }
  return sessionRoute('hexagram')
}

export function readSession(query: Record<string, string | undefined>): CastSession | undefined {
  const route = parseRoute(query)
  if (!route || !active || route.sid !== active.sid) return undefined
  const session = active.session
  if (session.hexagramId !== route.id || session.mode !== route.mode) return undefined
  if (session.mode === 'number' && session.fixed !== route.fixed) return undefined
  return session
}

export function updateSelection(session: CastSession, positions: LinePosition[]) {
  if (session.mode === 'number') resultForSession(session, positions)
  else session.selected = normalizePositions(positions)
}

export function sessionRoute(page: 'hexagram' | 'changes' | 'analysis'): string {
  if (!active) throw new Error('没有本次生成结果')
  const { sid, session } = active
  const fixed = session.mode === 'number' ? `&fixed=${session.fixed}` : ''
  return `/pages/${page}/index?sid=${sid}&id=${session.hexagramId}&mode=${session.mode}${fixed}`
}
