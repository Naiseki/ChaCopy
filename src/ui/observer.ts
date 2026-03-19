import { injectButtonIntoCopyButton } from './button';

const COPY_BTN_SELECTOR = '[data-testid="copy-turn-action-button"]';

/**
 * ChatGPT ページの動的更新を監視し、新しいメッセージに MD ボタンを注入する。
 *
 * main 要素以下の DOM 変化を監視し、新しいコピーボタンが出現したら
 * その場で MD ボタンを注入する。
 */
export function startObserver(): void {
    const target = document.querySelector('main') ?? document.body;

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) {
                    continue;
                }

                if (node.matches(COPY_BTN_SELECTOR)) {
                    injectButtonIntoCopyButton(node);
                }

                for (const copyButton of node.querySelectorAll<HTMLElement>(COPY_BTN_SELECTOR)) {
                    injectButtonIntoCopyButton(copyButton);
                }
            }
        }
    });

    observer.observe(target, { childList: true, subtree: true });
}
