import { HEXAGRAM_CONTENT } from './content'
import { getHexagram } from '../domain/hexagrams'
export function getContent(id: number) { return HEXAGRAM_CONTENT.find(item => item.id === id) }
export function getCollectedHexagrams() { return HEXAGRAM_CONTENT.map(item => getHexagram(item.id)) }
