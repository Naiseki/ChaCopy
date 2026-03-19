import { domToMarkdown } from '../converter/index';

const INJECTED_ATTR = 'data-chacopy-injected';
const COPY_BTN_SELECTOR = '[data-testid="copy-turn-action-button"]';
const CONTENT_SELECTOR = '.markdown.prose';
const ASSISTANT_SELECTOR = '[data-message-author-role="assistant"]';
const RESPONSE_ACTIONS_SELECTOR = '[aria-label="Response actions"]';

/**
 * ページ内の既存アシスタントメッセージに MD ボタンを注入する。
 *
 * 既存の ChatGPT コピーボタンを起点に、対応するアシスタントメッセージへ
 * MD ボタンを注入する。
 */
export function injectButtonsIntoPage(): void {
    const copyButtons = document.querySelectorAll<HTMLElement>(COPY_BTN_SELECTOR);
    for (const copyButton of copyButtons) {
        injectButtonIntoCopyButton(copyButton);
    }
}

/**
 * 指定のコピーボタンの横に MD ボタンを注入する（冪等操作）。
 *
 * すでに注入済みの場合は何もしない。コピーボタンが見つからない場合も処理をスキップ。
 *
 * @param copyButton - ChatGPT 既存のコピーボタン
 */
export function injectButtonIntoCopyButton(copyButton: HTMLElement): boolean {
    if (copyButton.parentElement?.querySelector('[data-chacopy-button="true"]')) {
        return false;
    }
    if (!findMessageRoot(copyButton)) {
        return false;
    }

    const mdButton = createMdButton(copyButton);
    copyButton.insertAdjacentElement('afterend', mdButton);
    return true;
}

/**
 * MD ボタン要素を作成する。
 *
 * 作成されるボタンの特徴:
 * - 初期状態: コピーアイコン画像（img/copy_btn.png）を表示
 * - ホバー時: 背景色と透明度が変化
 * - クリック時: スケール（0.95倍に縮小）
 * - クリック後: "Copied!" またはエラーメッセージを1.5秒表示
 *
 * @param copyButton - 元になった ChatGPT のコピーボタン
 * @returns 作成された button 要素
 */
function createMdButton(copyButton: HTMLElement): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Copy as Markdown');
    btn.setAttribute('title', 'Copy as Markdown (ChaCopy)');
    btn.setAttribute('data-chacopy-button', 'true');

    // 洗練されたモダンデザイン
    btn.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        padding: 6px 10px;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: 8px;
        background-color: transparent;
        transition: all 150ms cubic-bezier(0.2, 0, 0.38, 0.9);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        position: relative;
        opacity: 0.8;
    `;

    // コピーアイコン画像を設定
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('img/chacopy_icon48.png');
    img.alt = 'Copy';
    img.style.cssText = 'width: 19px; height: 19px; object-fit: contain;';
    btn.appendChild(img);

    // 初期状態（画像）を保存
    const initialHTML = btn.innerHTML;

    // ホバー時のスタイル
    btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = 'var(--hover-bg, rgba(0, 0, 0, 0.05))';
        btn.style.borderColor = 'var(--hover-border, rgba(0, 0, 0, 0.08))';
        btn.style.opacity = '1';
    });

    // マウスアウト時のスタイル
    btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = 'transparent';
        btn.style.borderColor = 'transparent';
        btn.style.opacity = '0.8';
    });

    // アクティブ時（クリック中）
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.95)';
    });

    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1)';
    });

    btn.addEventListener('click', () => void handleClick(copyButton, btn, initialHTML));

    return btn;
}

/**
 * MD ボタンのクリックハンドラー。
 *
 * 処理フロー:
 * 1. article からコンテンツ（.markdown.prose）を取得
 * 2. domToMarkdown() で Markdown に変換
 * 3. navigator.clipboard.writeText() でクリップボードにコピー
 * 4. 成功時: ボタンに "Copied!" を表示
 * 5. 失敗時: ボタンに "ERROR" を表示
 * 6. 1.5 秒後: 初期状態（アイコン）に戻す
 *
 * @param copyButton - 押下元と同じターンにある ChatGPT のコピーボタン
 * @param btn - フィードバック表示用のボタン要素
 * @param initialHTML - ボタンの初期状態（アイコン）の HTML
 */
async function handleClick(copyButton: HTMLElement, btn: HTMLButtonElement, initialHTML: string): Promise<void> {
    const messageRoot = findMessageRoot(copyButton);
    if (!messageRoot) {
        console.warn('[ChaCopy] Message root not found');
        return;
    }

    if (!messageRoot.hasAttribute(INJECTED_ATTR)) {
        messageRoot.setAttribute(INJECTED_ATTR, 'true');
    }

    const contentEl = messageRoot.querySelector<HTMLElement>(CONTENT_SELECTOR);
    if (!contentEl) {
        console.warn('[ChaCopy]  Message element not found');
        return;
    }

    const markdown = domToMarkdown(contentEl);

    try {
        await navigator.clipboard.writeText(markdown);
        btn.innerHTML = '';
        btn.style.color = '#00ff7f';
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.innerHTML = initialHTML; }, 1500);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[ChaCopy] Failed to write to clipboard:', message);
        btn.innerHTML = '';
        btn.style.color = '#ff4500'; // エラーメッセージは赤色に
        btn.textContent = 'ERROR';
        setTimeout(() => { btn.innerHTML = initialHTML; }, 1500);
    }
}

function findMessageRoot(copyButton: HTMLElement): HTMLElement | null {
    const responseActions = copyButton.closest<HTMLElement>(RESPONSE_ACTIONS_SELECTOR);
    if (!responseActions) {
        return null;
    }

    let current = responseActions.parentElement;
    while (current) {
        if (
            current.querySelector(ASSISTANT_SELECTOR) &&
            current.querySelector(CONTENT_SELECTOR) &&
            current.querySelector(RESPONSE_ACTIONS_SELECTOR)
        ) {
            return current;
        }
        current = current.parentElement;
    }

    return null;
}
