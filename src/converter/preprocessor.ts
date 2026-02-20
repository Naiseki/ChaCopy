/**
 * ChatGPT メッセージ DOM を Turndown 変換前に前処理する。
 *
 * 以下の処理を順次実行:
 * 1. ノードを深複製（元の DOM は変更しない）
 * 2. KaTeX span を Markdown 互換の数式表現に置換
 * 3. ChatGPT の UI クローム（脚注、引用、上付き文字）を除去
 *
 * @param node - 変換対象の HTMLElement
 * @returns 前処理済みの HTMLElement（クローン）
 */
export function preprocessNode(node: HTMLElement): HTMLElement {
    const clone = node.cloneNode(true) as HTMLElement;
    replaceKatexNodes(clone);
    removeUiChrome(clone);
    return clone;
}

/**
 * KaTeX span を Markdown 互換の数式表現に置換する。
 *
 * 処理順序:
 * 1. ブロック数式（katex-display） → `$$...$$` に置換
 * 2. インライン数式（span.katex）   → `$...$` に置換
 *
 * ブロック数式を先に処理することで、内部の span.katex が
 * 後続のインライン処理で重複マッチされるのを防ぐ。
 *
 * @param root - 処理対象のルート HTMLElement
 */
function replaceKatexNodes(root: HTMLElement): void {
    // ブロック数式を先に処理（katex-display は katex を内包する）。
    // 先に処理することで内部の span.katex が後続のインライン処理で重複マッチしない。
    const displaySpans = Array.from(
        root.querySelectorAll<HTMLElement>('span.katex-display')
    );
    for (const display of displaySpans) {
        const annotation = display.querySelector(
            'annotation[encoding="application/x-tex"]'
        );
        if (!annotation) continue;
        const latex = annotation.textContent?.trim() ?? '';
        const replacement = createMathNode(`\n\n$$${latex}$$\n\n`, root);
        display.replaceWith(replacement);
    }

    // 残りのインライン数式（katex-display に含まれないもの）を処理
    const inlineSpans = Array.from(
        root.querySelectorAll<HTMLElement>('span.katex')
    );
    for (const span of inlineSpans) {
        const annotation = span.querySelector(
            'annotation[encoding="application/x-tex"]'
        );
        if (!annotation) continue;
        const latex = annotation.textContent?.trim() ?? '';
        const replacement = createMathNode(`$${latex}$`, root);
        span.replaceWith(replacement);
    }
}

/**
 * 数式を格納するための span 要素を作成する。
 *
 * 作成される span には以下の特性がある:
 * - オーナードキュメント: contextNode のオーナードキュメントに従う（フォールバック: グローバル document）
 * - 属性: `data-chappymd-math="true"` を設定
 * - コンテンツ: 提供された content を textContent として格納
 *
 * @param content - span に格納する数式コンテンツ（例: 生の LaTeX）
 * @param contextNode - オーナードキュメント取得用のコンテキスト要素
 * @returns 数式を格納し、マーカー属性を持つ HTMLSpanElement
 */
function createMathNode(content: string, contextNode: HTMLElement): HTMLSpanElement {
    const doc = contextNode.ownerDocument ?? document;
    const span = doc.createElement('span');
    span.setAttribute('data-chappymd-math', 'true');
    span.textContent = content;
    return span;
}

/**
 * ChatGPT の UI クローム（不要な要素）を除去する。
 *
 * 除去対象:
 * - `[data-footnotes]` - 脚注マーカー
 * - `.citation`       - 引用記号
 * - `sup`            - 上付き文字（数式指数など）
 *
 * @param root - 処理対象のルート HTMLElement
 */
function removeUiChrome(root: HTMLElement): void {
    for (const el of root.querySelectorAll('[data-footnotes], .citation, sup')) {
        el.remove();
    }
}
