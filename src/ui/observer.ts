import { injectButtonIntoArticle } from './button'

const ARTICLE_SELECTOR = 'article[data-testid^="conversation-turn-"]'
const COPY_BTN_SELECTOR = '[data-testid="copy-turn-action-button"]'

/**
 * ChatGPT ページの動的更新を監視し、新しいメッセージに MD ボタンを注入する。
 *
 * main 要素の MutationObserver を2段階で実行:
 * 1. 外側オブザーバー: article 要素の追加を検出
 * 2. 内側オブザーバー: コピーボタン出現（ストリーミング完了）を待機
 */
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

/**
 * article 要素を処理する。
 *
 * アシスタントメッセージのみを対象とし、コピーボタン出現まで待機する。
 *
 * @param article - 処理対象の article 要素
 */
function handleArticle(article: HTMLElement): void {
    if (!isAssistantArticle(article)) return
    waitForCopyButton(article)
}

/**
 * article 要素がアシスタントメッセージか判定する。
 *
 * @param article - 判定対象の article 要素
 * @returns アシスタントメッセージの場合 true
 */
function isAssistantArticle(article: HTMLElement): boolean {
    return article.querySelector('[data-message-author-role="assistant"]') !== null
}

/**
 * コピーボタンの出現を待機する。
 *
 * コピーボタンが既に存在する場合は即座にボタンを注入。
 * 存在しない場合は、内側 MutationObserver でコピーボタン出現を監視する。
 * コピーボタン出現 = ストリーミング完了の合図。
 *
 * @param article - 監視対象の article 要素
 */
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
