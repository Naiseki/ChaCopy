import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { preprocessNode } from '../src/converter/preprocessor'

function makeElement(html: string): HTMLElement {
  const dom = new JSDOM(`<div>${html}</div>`)
  return dom.window.document.querySelector('div') as HTMLElement
}

describe('preprocessor', () => {
  it('does not mutate the original node', () => {
    const original = makeElement(
      '<span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span>'
    )
    const originalHTML = original.innerHTML
    preprocessNode(original)
    expect(original.innerHTML).toBe(originalHTML)
  })

  it('replaces inline KaTeX with $...$', () => {
    const el = makeElement(
      '<p>See <span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span> here</p>'
    )
    const result = preprocessNode(el)
    expect(result.textContent).toContain('$x^2$')
    expect(result.querySelector('span.katex')).toBeNull()
  })

  it('replaces block KaTeX with $$...$$', () => {
    const el = makeElement(
      '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">\\sum_i</annotation></span></span>'
    )
    const result = preprocessNode(el)
    expect(result.textContent).toContain('$$\\sum_i$$')
    expect(result.querySelector('span.katex-display')).toBeNull()
    expect(result.querySelector('span.katex')).toBeNull()
  })

  it('does not double-process inner katex of katex-display', () => {
    const el = makeElement(
      '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">E=mc^2</annotation></span></span>'
    )
    const result = preprocessNode(el)
    // Should produce exactly ONE math span (block form), not two
    const mathSpans = result.querySelectorAll('[data-chappymd-math]')
    expect(mathSpans).toHaveLength(1)
    expect(mathSpans[0].textContent).toContain('$$E=mc^2$$')
  })

  it('leaves non-KaTeX content unchanged', () => {
    const el = makeElement('<p>Hello <strong>world</strong></p>')
    const result = preprocessNode(el)
    expect(result.querySelector('strong')?.textContent).toBe('world')
  })

  it('removes sup elements (UI chrome)', () => {
    const el = makeElement('<p>Text<sup>1</sup></p>')
    const result = preprocessNode(el)
    expect(result.querySelector('sup')).toBeNull()
  })
})
