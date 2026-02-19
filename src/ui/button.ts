import { domToMarkdown } from '../converter/index'

const INJECTED_ATTR = 'data-chappymd-injected'
const COPY_BTN_SELECTOR = '[data-testid="copy-turn-action-button"]'
const CONTENT_SELECTOR = '.markdown.prose'

/** ページ内の既存アシスタントメッセージにボタンを注入する */
export function injectButtonsIntoPage(): void {
    const articles = document.querySelectorAll<HTMLElement>(
        'article[data-testid^="conversation-turn-"]'
    )
    for (const article of articles) {
        if (
            article.querySelector('[data-message-author-role="assistant"]') &&
            article.querySelector(COPY_BTN_SELECTOR)
        ) {
            injectButtonIntoArticle(article)
        }
    }
}

/** 指定の article に MD ボタンを注入する（冪等） */
export function injectButtonIntoArticle(article: HTMLElement): void {
    if (article.hasAttribute(INJECTED_ATTR)) return

    const copyButton = article.querySelector<HTMLElement>(COPY_BTN_SELECTOR)
    if (!copyButton) return

    const mdButton = createMdButton(article)
    copyButton.insertAdjacentElement('afterend', mdButton)
    article.setAttribute(INJECTED_ATTR, 'true')
}

function createMdButton(article: HTMLElement): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.textContent = 'MD'
    btn.setAttribute('aria-label', 'Copy as Markdown')
    btn.setAttribute('title', 'Copy as Markdown (ChappyMD)')
    btn.style.cssText =
        'font-size:12px;font-weight:600;padding:2px 6px;' +
        'cursor:pointer;border:none;background:transparent;' +
        'border-radius:6px;color:inherit;'

    btn.addEventListener('click', () => void handleClick(article, btn))

    return btn
}

async function handleClick(article: HTMLElement, btn: HTMLButtonElement): Promise<void> {
    const contentEl = article.querySelector<HTMLElement>(CONTENT_SELECTOR)
    if (!contentEl) {
        console.warn('[ChappyMD] メッセージ要素が見つかりません')
        return
    }

    const markdown = domToMarkdown(contentEl)

    try {
        await navigator.clipboard.writeText(markdown)
        const original = btn.textContent
        btn.textContent = 'OK'
        setTimeout(() => { btn.textContent = original }, 1500)
    } catch (err) {
        console.error('[ChappyMD] クリップボード書き込み失敗:', err)
        btn.textContent = 'ERR'
        setTimeout(() => { btn.textContent = 'MD' }, 1500)
    }
}
