import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { domToMarkdown } from '../src/converter/index'

function makeMessageContent(html: string): HTMLElement {
  const dom = new JSDOM(`<div class="markdown prose">${html}</div>`)
  // preprocessor の createElement 用に jsdom の document を設定
  globalThis.document = dom.window.document as unknown as Document
  return dom.window.document.querySelector('div') as HTMLElement
}

describe('domToMarkdown 統合テスト', () => {
  it('見出しを変換する', () => {
    const el = makeMessageContent('<h2>Hello</h2>')
    expect(domToMarkdown(el)).toContain('## Hello')
  })

  it('フェンスコードブロックを変換する', () => {
    const el = makeMessageContent(
      '<pre><code class="language-typescript">const x = 1</code></pre>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('```')
    expect(md).toContain('const x = 1')
  })

  it('インライン KaTeX を $...$ に変換する', () => {
    const el = makeMessageContent(
      '<p>The formula <span class="katex"><annotation encoding="application/x-tex">E=mc^2</annotation></span> is famous</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('$E=mc^2$')
    expect(md).not.toContain('annotation')
  })

  it('ブロック KaTeX を $$...$$ に変換する', () => {
    const el = makeMessageContent(
      '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">\\sum_{i=0}^n i</annotation></span></span>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('$$\\sum_{i=0}^n i$$')
  })

  it('日本語に隣接する太字の前後に空白を付与する', () => {
    const el = makeMessageContent(
      '<p>これは<strong>重要</strong>です</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain(' **重要** ')
  })

  it('インラインコード内の太字は変更しない', () => {
    const el = makeMessageContent(
      '<p>Run <code>日本語**cmd**</code> here</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('`日本語**cmd**`')
  })

  it('ネストしたリスト構造を保持する', () => {
    const el = makeMessageContent(
      '<ul><li>Parent<ul><li>Child</li></ul></li></ul>'
    )
    const md = domToMarkdown(el)
    // Turndown はインデント幅が変わり得るため柔軟にマッチ
    expect(md).toMatch(/-\s+Parent/)
    // 子要素は親より深くインデントされている
    expect(md).toMatch(/\s{2,}-\s+Child/)
  })

  it('GFM テーブルを変換する', () => {
    const el = makeMessageContent(
      '<table><thead><tr><th>A</th><th>B</th></tr></thead>' +
      '<tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('|')
    expect(md).toContain('A')
    expect(md).toContain('B')
  })

  it('KaTeX と太字正規化を組み合わせて処理する', () => {
    const el = makeMessageContent(
      '<p>式<span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span>で<strong>重要</strong>です</p>'
    )
    const md = domToMarkdown(el)
    expect(md).toContain('$x^2$')
    expect(md).toContain(' **重要** ')
  })

  it('括弧で終わる複数の太字スパンをエスケープせず変換する', () => {
    const el = makeMessageContent(
      '<p>は<strong>確率密度関数（PDF）</strong>または離散なら<strong>確率質量関数（PMF）</strong>です。</p>'
    )
    const md = domToMarkdown(el)
    // \\*\\* にエスケープされていないこと
    expect(md).not.toContain('\\*')
    expect(md).toContain('**確率密度関数（PDF）**')
    expect(md).toContain('**確率質量関数（PMF）**')
  })
})
