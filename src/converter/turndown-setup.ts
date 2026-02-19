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

    // GFM プラグイン: テーブル (| col | col |) と取消線を追加
    service.use(gfm)

    // 数式パススルールール: textContent をエスケープせずそのまま返す。
    // gfm より後に追加することで優先度が高くなる。
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

    // <br> を改行に変換
    service.addRule('linebreak', {
        filter: ['br'],
        replacement() {
            return '\n'
        },
    })

    _service = service
    return service
}
