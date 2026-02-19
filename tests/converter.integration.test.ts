import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { domToMarkdown } from '../src/converter/index'

function makeMessageContent(html: string): HTMLElement {
  const dom = new JSDOM(`<div class="markdown prose">${html}</div>`)
  // Make the jsdom document available for preprocessor's createElement
  globalThis.document = dom.window.document as unknown as Document
  return dom.window.document.querySelector('div') as HTMLElement
}

beforeEach(() => {
  // Reset singleton between tests so custom rules are registered cleanly
  // (import the module-level reset if needed, but Turndown singleton is fine)
})

describe('domToMarkdown integration', () => {
  it('converts a heading', () => {
    const el = makeMessageContent('<h2>Hello</h2>')
    expect(domToMarkdown(el)).toContain('## Hello')
  })

  it('converts a fenced code block', () => {
    const el = makeMessageContent(
      '<pre><code class="language-typescript">const x = 1</code></pre>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('```')
    expect(md).toContain('const x = 1')
  })

  it('converts inline KaTeX to $...$', () => {
    const el = makeMessageContent(
      '<p>The formula <span class="katex"><annotation encoding="application/x-tex">E=mc^2</annotation></span> is famous</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('$E=mc^2$')
    expect(md).not.toContain('annotation')
  })

  it('converts block KaTeX to $$...$$', () => {
    const el = makeMessageContent(
      '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">\\sum_{i=0}^n i</annotation></span></span>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('$$\\sum_{i=0}^n i$$')
  })

  it('normalizes bold adjacent to Japanese text', () => {
    const el = makeMessageContent(
      '<p>これは<strong>重要</strong>です</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain(' **重要** ')
  })

  it('does not modify bold inside inline code', () => {
    const el = makeMessageContent(
      '<p>Run <code>日本語**cmd**</code> here</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('`日本語**cmd**`')
  })

  it('preserves nested list structure', () => {
    const el = makeMessageContent(
      '<ul><li>Parent<ul><li>Child</li></ul></li></ul>'
    )
    const md = domToMarkdown(el)
    // Turndown may output `- ` or `-   ` (with extra spaces); allow flexible spacing
    expect(md).toMatch(/-\s+Parent/)
    // Child should appear indented (at least 2 spaces) relative to parent
    expect(md).toMatch(/\s{2,}-\s+Child/)
  })

  it('converts a GFM table', () => {
    const el = makeMessageContent(
      '<table><thead><tr><th>A</th><th>B</th></tr></thead>' +
      '<tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('|')
    expect(md).toContain('A')
    expect(md).toContain('B')
  })

  it('combines KaTeX and bold normalization', () => {
    const el = makeMessageContent(
      '<p>式<span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span>で<strong>重要</strong>です</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('$x^2$')
    expect(md).toContain(' **重要** ')
  })
})
