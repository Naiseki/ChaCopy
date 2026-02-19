import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

let _service: TurndownService | null = null

export function getTurndownService(): TurndownService {
  if (_service) return _service

  const service = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    strongDelimiter: '**',
    emDelimiter: '*',
  })

  // GFM plugin: adds table support (| col | col |) and strikethrough
  service.use(gfm)

  // Math passthrough rule: return textContent verbatim without escaping.
  // This must be added AFTER gfm so it takes precedence.
  service.addRule('chappymd-math', {
    filter(node) {
      return (
        node.nodeName === 'SPAN' &&
        (node as Element).hasAttribute('data-chappymd-math')
      )
    },
    replacement(_content, node) {
      return (node as Element).textContent ?? ''
    },
  })

  // Convert <br> to a single newline
  service.addRule('linebreak', {
    filter: ['br'],
    replacement() {
      return '\n'
    },
  })

  _service = service
  return service
}
