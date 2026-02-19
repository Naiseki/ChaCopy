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
    btn.setAttribute('aria-label', 'Copy as Markdown')
    btn.setAttribute('title', 'Copy as Markdown (ChappyMD)')

    // 洗練されたモダンデザイン
    btn.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        padding: 6px 10px;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: 8px;
        background-color: transparent;
        color: #00ff7f;
        transition: all 150ms cubic-bezier(0.2, 0, 0.38, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        position: relative;
        opacity: 0.8;
    `

    // コピーアイコン画像を設定
    const img = document.createElement('img')
    img.src = chrome.runtime.getURL('img/copy_btn.png')
    img.alt = 'Copy'
    img.style.cssText = 'width: 19px; height: 19px; object-fit: contain;'
    btn.appendChild(img)

    // 初期状態（画像）を保存
    const initialHTML = btn.innerHTML

    // ホバー時のスタイル
    btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = 'var(--hover-bg, rgba(0, 0, 0, 0.05))'
        btn.style.borderColor = 'var(--hover-border, rgba(0, 0, 0, 0.08))'
        btn.style.opacity = '1'
    })

    // マウスアウト時のスタイル
    btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = 'transparent'
        btn.style.borderColor = 'transparent'
        btn.style.opacity = '0.8'
    })

    // アクティブ時（クリック中）
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)'
    })

    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1)'
    })

    btn.addEventListener('click', () => void handleClick(article, btn, initialHTML))

    return btn
}

async function handleClick(article: HTMLElement, btn: HTMLButtonElement, initialHTML: string): Promise<void> {
    const contentEl = article.querySelector<HTMLElement>(CONTENT_SELECTOR)
    if (!contentEl) {
        console.warn('[ChappyMD] メッセージ要素が見つかりません')
        return
    }

    const markdown = domToMarkdown(contentEl)

    try {
        await navigator.clipboard.writeText(markdown)
        btn.innerHTML = ''
        btn.textContent = 'Copied!'
        setTimeout(() => { btn.innerHTML = initialHTML }, 1500)
    } catch (err) {
        console.error('[ChappyMD] クリップボード書き込み失敗:', err)
        btn.innerHTML = ''
        btn.textContent = 'ERR'
        setTimeout(() => { btn.innerHTML = initialHTML }, 1500)
    }
}
