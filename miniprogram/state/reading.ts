export interface ReadingContext {
  key: string
  ids: readonly number[]
  filtered: boolean
}

let serial = 0
let active: ReadingContext | undefined

export function startReading(ids: readonly number[], filtered: boolean): ReadingContext {
  active = { key: String(++serial), ids: [...ids], filtered }
  return active
}

export function readReading(key: string, id: number): ReadingContext | undefined {
  return active?.key === key && active.ids.includes(id) ? active : undefined
}

export function endReading(context: ReadingContext | undefined): void {
  if (active === context) active = undefined
}
