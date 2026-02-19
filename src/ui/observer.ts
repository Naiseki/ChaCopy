import { injectButtonIntoArticle } from './button'

const ARTICLE_SELECTOR = 'article[data-testid^="conversation-turn-"]'
const COPY_BTN_SELECTOR = '[data-testid="copy-turn-action-button"]'

export function startObserver(): void {
    const target = document.querySelector('main') ?? document.body

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue

                if (node.matches(ARTICLE_SELECTOR)) {
                    handleArticle(node)
                    continue
                }

                for (const article of node.querySelectorAll<HTMLElement>(ARTICLE_SELECTOR)) {
                    handleArticle(article)
                }
            }
        }
    })

    observer.observe(target, { childList: true, subtree: true })
}

function handleArticle(article: HTMLElement): void {
    if (!isAssistantArticle(article)) return
    waitForCopyButton(article)
}

function isAssistantArticle(article: HTMLElement): boolean {
    return article.querySelector('[data-message-author-role="assistant"]') !== null
}

function waitForCopyButton(article: HTMLElement): void {
    if (article.querySelector(COPY_BTN_SELECTOR)) {
        injectButtonIntoArticle(article)
        return
    }

    // コピーボタンはストリーミング完了時に出現する。それを待って注入する。
    const innerObserver = new MutationObserver((_mutations, obs) => {
        if (article.querySelector(COPY_BTN_SELECTOR)) {
            obs.disconnect()
            injectButtonIntoArticle(article)
        }
    })

    innerObserver.observe(article, { childList: true, subtree: true })
}
