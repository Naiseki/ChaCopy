import { domToMarkdown } from '../converter/index';

const INJECTED_ATTR = 'data-chacopy-injected';
const COPY_BTN_SELECTOR = '[data-testid="copy-turn-action-button"]';
const CONTENT_SELECTOR = '.markdown.prose';

/**
 * ページ内の既存アシスタントメッセージに MD ボタンを注入する。
 *
 * 以下の条件を満たす article に対してボタンを注入:
 * - アシスタントメッセージである（data-message-author-role="assistant"）
 * - コピーボタンが既に存在している（ストリーミング完了を示す）
 */
export function injectButtonsIntoPage(): void {
    const articles = document.querySelectorAll<HTMLElement>(
        'article[data-testid^="conversation-turn-"]'
    );
    for (const article of articles) {
        if (
            article.querySelector('[data-message-author-role="assistant"]') &&
            article.querySelector(COPY_BTN_SELECTOR)
        ) {
            injectButtonIntoArticle(article);
        }
    }
}

/**
 * 指定の article に MD ボタンを注入する（冪等操作）。
 *
 * すでに注入済みの場合は何もしない。コピーボタンが見つからない場合も処理をスキップ。
 *
 * @param article - ボタンを注入する article 要素
 */
export function injectButtonIntoArticle(article: HTMLElement): void {
    if (article.hasAttribute(INJECTED_ATTR)) return;

    const copyButton = article.querySelector<HTMLElement>(COPY_BTN_SELECTOR);
    if (!copyButton) return;

    const mdButton = createMdButton(article);
    copyButton.insertAdjacentElement('afterend', mdButton);
    article.setAttribute(INJECTED_ATTR, 'true');
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
 * @param article - ボタンを関連付ける article 要素（クリック時に参照）
 * @returns 作成された button 要素
 */
function createMdButton(article: HTMLElement): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Copy as Markdown');
    btn.setAttribute('title', 'Copy as Markdown (ChaCopy)');

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

    btn.addEventListener('click', () => void handleClick(article, btn, initialHTML));

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
 * 5. 失敗時: ボタンに "ERR" を表示
 * 6. 1.5 秒後: 初期状態（アイコン）に戻す
 *
 * @param article - コンテンツを含む article 要素
 * @param btn - フィードバック表示用のボタン要素
 * @param initialHTML - ボタンの初期状態（アイコン）の HTML
 */
async function handleClick(article: HTMLElement, btn: HTMLButtonElement, initialHTML: string): Promise<void> {
    const contentEl = article.querySelector<HTMLElement>(CONTENT_SELECTOR);
    if (!contentEl) {
        console.warn('[ChaCopy] メッセージ要素が見つかりません');
        return;
    }

    // DEBUG: 変換前のテキストをログに出力
    console.log("[ChaCopy] コンテンツを Markdown に変換中...");
    console.log(contentEl); // 変換前のテキストをログに出力

    const markdown = domToMarkdown(contentEl);

    try {
        await navigator.clipboard.writeText(markdown);
        btn.innerHTML = '';
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.innerHTML = initialHTML; }, 1500);
    } catch (err) {
        console.error('[ChaCopy] クリップボード書き込み失敗:', err);
        btn.innerHTML = '';
        btn.style.color = '#ff4500'; // エラーメッセージは赤色に
        btn.textContent = 'ERR';
        setTimeout(() => { btn.innerHTML = initialHTML; }, 1500);
    }
}
