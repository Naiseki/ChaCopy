import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import { preprocessNode } from '../src/converter/preprocessor'

function makeElement(html: string): HTMLElement {
  const dom = new JSDOM(`<div>${html}</div>`)
  return dom.window.document.querySelector('div') as HTMLElement
}

describe('preprocessor', () => {
  it('元ノードを変更しない', () => {
    const original = makeElement(
      '<span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span>'
    )
    const originalHTML = original.innerHTML
    preprocessNode(original)
    expect(original.innerHTML).toBe(originalHTML)
  })

  it('インライン KaTeX を $...$ に変換する', () => {
    const el = makeElement(
      '<p>See <span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span> here</p>'
    )
    const result = preprocessNode(el)
    expect(result.textContent).toContain('$x^2$')
    expect(result.querySelector('span.katex')).toBeNull()
  })

  it('ブロック KaTeX を $$...$$ に変換する', () => {
    const el = makeElement(
      '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">\\sum_i</annotation></span></span>'
    )
    const result = preprocessNode(el)
    expect(result.textContent).toContain('$$\\sum_i$$')
    expect(result.querySelector('span.katex-display')).toBeNull()
    expect(result.querySelector('span.katex')).toBeNull()
  })

  it('katex-display 内部の katex を二重処理しない', () => {
    const el = makeElement(
      '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">E=mc^2</annotation></span></span>'
    )
    const result = preprocessNode(el)
    // 数式 span は1つだけ（ブロック形式）
    const mathSpans = result.querySelectorAll('[data-chappymd-math]')
    expect(mathSpans).toHaveLength(1)
    expect(mathSpans[0].textContent).toContain('$$E=mc^2$$')
  })

  it('KaTeX 以外のコンテンツは変更しない', () => {
    const el = makeElement('<p>Hello <strong>world</strong></p>')
    const result = preprocessNode(el)
    expect(result.querySelector('strong')?.textContent).toBe('world')
  })

  it('sup 要素（UI クローム）を除去する', () => {
    const el = makeElement('<p>Text<sup>1</sup></p>')
    const result = preprocessNode(el)
    expect(result.querySelector('sup')).toBeNull()
  })

  // it('strong 前後に隣接する非空白テキストへ空白を挿入する', () => {
  //   const el = makeElement('<p>日本語<strong>重要</strong>です</p>')
  //   const result = preprocessNode(el)
  //   // strong の前後のテキストノードに空白が追加される
  //   const p = result.querySelector('p')!
  //   const textBefore = p.childNodes[0].textContent ?? ''
  //   const textAfter = p.childNodes[2].textContent ?? ''
  //   expect(textBefore).toBe('日本語 ')
  //   expect(textAfter).toBe(' です')
  // })

  // it('strong 前後に既に空白がある場合は追加しない', () => {
  //   const el = makeElement('<p>日本語 <strong>重要</strong> です</p>')
  //   const result = preprocessNode(el)
  //   const p = result.querySelector('p')!
  //   const textBefore = p.childNodes[0].textContent ?? ''
  //   const textAfter = p.childNodes[2].textContent ?? ''
  //   expect(textBefore).toBe('日本語 ')
  //   expect(textAfter).toBe(' です')
  // })

  // it('括弧で終わる strong でも正しく空白を挿入する', () => {
  //   const el = makeElement(
  //     '<p>は<strong>確率密度関数（PDF）</strong>または<strong>確率質量関数（PMF）</strong>です。</p>'
  //   )
  //   const result = preprocessNode(el)
  //   const p = result.querySelector('p')!
  //   // 各テキストノードの境界を検証
  //   expect(p.childNodes[0].textContent).toBe('は ')
  //   expect(p.childNodes[2].textContent).toBe(' または ')
  //   expect(p.childNodes[4].textContent).toBe(' です。')
  // })
})
