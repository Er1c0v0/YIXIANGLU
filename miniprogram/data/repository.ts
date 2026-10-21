import { SAMPLE_CONTENT } from './content'
export function getContent(id: number) { return SAMPLE_CONTENT.find(item => item.id === id) }
