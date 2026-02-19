import { preprocessNode } from './preprocessor'
import { getTurndownService } from './turndown-setup'
import { postprocess } from './postprocessor'

/**
 * ChatGPT メッセージの DOM ノードを Markdown に変換する。
 * 元のノードは変更しない。
 */
export function domToMarkdown(contentNode: HTMLElement): string {
    const processedNode = preprocessNode(contentNode)
    const service = getTurndownService()
    const rawMarkdown = service.turndown(processedNode)
    return postprocess(rawMarkdown)
}
