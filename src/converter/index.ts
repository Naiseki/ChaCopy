import { preprocessNode } from './preprocessor'
import { getTurndownService } from './turndown-setup'
import { postprocess } from './postprocessor'

/**
 * Converts a ChatGPT message content DOM node to clean Markdown.
 * Does NOT mutate the original node.
 */
export function domToMarkdown(contentNode: HTMLElement): string {
  const processedNode = preprocessNode(contentNode)
  const service = getTurndownService()
  const rawMarkdown = service.turndown(processedNode)
  return postprocess(rawMarkdown)
}
