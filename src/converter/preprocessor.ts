/**
 * Preprocesses a ChatGPT message DOM node before Turndown conversion.
 *
 * Transformations:
 * 1. Deep-clones the node (never mutates the live DOM)
 * 2. Replaces KaTeX spans with math placeholder spans
 * 3. Removes ChatGPT UI chrome elements
 */
export function preprocessNode(node: HTMLElement): HTMLElement {
  const clone = node.cloneNode(true) as HTMLElement
  replaceKatexNodes(clone)
  removeUiChrome(clone)
  return clone
}

function replaceKatexNodes(root: HTMLElement): void {
  // Process block math first (katex-display wraps katex)
  // By processing katex-display first, the inner span.katex is removed from the DOM
  // and won't be matched in the subsequent inline pass.
  const displaySpans = Array.from(
    root.querySelectorAll<HTMLElement>('span.katex-display')
  )
  for (const display of displaySpans) {
    const annotation = display.querySelector(
      'annotation[encoding="application/x-tex"]'
    )
    if (!annotation) continue
    const latex = annotation.textContent?.trim() ?? ''
    const replacement = createMathNode(`\n\n$$${latex}$$\n\n`, root)
    display.replaceWith(replacement)
  }

  // Process remaining inline math (span.katex not inside span.katex-display)
  const inlineSpans = Array.from(
    root.querySelectorAll<HTMLElement>('span.katex')
  )
  for (const span of inlineSpans) {
    const annotation = span.querySelector(
      'annotation[encoding="application/x-tex"]'
    )
    if (!annotation) continue
    const latex = annotation.textContent?.trim() ?? ''
    const replacement = createMathNode(`$${latex}$`, root)
    span.replaceWith(replacement)
  }
}

function createMathNode(content: string, contextNode: HTMLElement): HTMLSpanElement {
  const doc = contextNode.ownerDocument ?? document
  const span = doc.createElement('span')
  span.setAttribute('data-chappymd-math', 'true')
  span.textContent = content
  return span
}

function removeUiChrome(root: HTMLElement): void {
  for (const el of root.querySelectorAll('[data-footnotes], .citation, sup')) {
    el.remove()
  }
}
