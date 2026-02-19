/**
 * ChatGPT メッセージ DOM を Turndown 変換前に前処理する。
 *
 * 変換内容:
 * 1. ノードを深複製（元DOMは変更しない）
 * 2. KaTeX span を数式プレースホルダに置換
 * 3. <strong> 前後に空白を挿入（Turndown のエスケープ防止）
 * 4. ChatGPT の UI 要素を除去
 */
export function preprocessNode(node: HTMLElement): HTMLElement {
    const clone = node.cloneNode(true) as HTMLElement
    replaceKatexNodes(clone)
    // normalizeStrongSpacing(clone)
    removeUiChrome(clone)
    return clone
}

function replaceKatexNodes(root: HTMLElement): void {
    // ブロック数式を先に処理（katex-display は katex を内包する）。
    // 先に処理することで内部の span.katex が後続のインライン処理で重複マッチしない。
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

    // 残りのインライン数式（katex-display に含まれないもの）を処理
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

/**
 * <strong> 要素の前後に隣接するテキストノードへ空白を挿入する。
 *
 * 目的: Turndown は CommonMark のフランキングルールに基づき、
 * `）**` のように句読点・括弧に隣接した `**` をエスケープ（`\*\*`）
 * してしまう。DOM 段階で空白を入れることでこれを防ぐ。
 */
function normalizeStrongSpacing(root: HTMLElement): void {
    const strongs = Array.from(root.querySelectorAll('strong'))
    for (const strong of strongs) {
        // 直前のテキストノードが非空白で終わる場合、空白を追加
        const prev = strong.previousSibling
        if (prev && prev.nodeType === Node.TEXT_NODE) {
            const text = prev.textContent ?? ''
            if (text.length > 0 && !/\s$/.test(text)) {
                prev.textContent = text + ' '
            }
        }

        // 直後のテキストノードが非空白で始まる場合、空白を追加
        const next = strong.nextSibling
        if (next && next.nodeType === Node.TEXT_NODE) {
            const text = next.textContent ?? ''
            if (text.length > 0 && !/^\s/.test(text)) {
                next.textContent = ' ' + text
            }
        }
    }
}

function removeUiChrome(root: HTMLElement): void {
    for (const el of root.querySelectorAll('[data-footnotes], .citation, sup')) {
        el.remove()
    }
}
