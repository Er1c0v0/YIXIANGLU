import { HEXAGRAM_CONTENT } from './content'
export function getContent(id: number) { return HEXAGRAM_CONTENT.find(item => item.id === id) }
