import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { preprocessNode } from '../src/converter/preprocessor';

function makeElement(html: string): HTMLElement {
    const dom = new JSDOM(`<div>${html}</div>`);
    return dom.window.document.querySelector('div') as HTMLElement;
}

describe('preprocessor', () => {
    it('元ノードを変更しない', () => {
        const original = makeElement(
            '<span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span>'
        );
        const originalHTML = original.innerHTML;
        preprocessNode(original);
        expect(original.innerHTML).toBe(originalHTML);
    });

    it('インライン KaTeX を $...$ に変換する', () => {
        const el = makeElement(
            '<p>See <span class="katex"><annotation encoding="application/x-tex">x^2</annotation></span> here</p>'
        );
        const result = preprocessNode(el);
        expect(result.textContent).toContain('$x^2$');
        expect(result.querySelector('span.katex')).toBeNull();
    });

    it('ブロック KaTeX を $$...$$ に変換する', () => {
        const el = makeElement(
            '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">\\sum_i</annotation></span></span>'
        );
        const result = preprocessNode(el);
        expect(result.textContent).toContain('$$\\sum_i$$');
        expect(result.querySelector('span.katex-display')).toBeNull();
        expect(result.querySelector('span.katex')).toBeNull();
    });

    it('katex-display 内部の katex を二重処理しない', () => {
        const el = makeElement(
            '<span class="katex-display"><span class="katex"><annotation encoding="application/x-tex">E=mc^2</annotation></span></span>'
        );
        const result = preprocessNode(el);
        // 数式 span は1つだけ（ブロック形式）
        const mathSpans = result.querySelectorAll('[data-chacopy-math]');
        expect(mathSpans).toHaveLength(1);
        expect(mathSpans[0].textContent).toContain('$$E=mc^2$$');
    });

    it('KaTeX 以外のコンテンツは変更しない', () => {
        const el = makeElement('<p>Hello <strong>world</strong></p>');
        const result = preprocessNode(el);
        expect(result.querySelector('strong')?.textContent).toBe('world');
    });

    it('sup 要素（UI クローム）を除去する', () => {
        const el = makeElement('<p>Text<sup>1</sup></p>');
        const result = preprocessNode(el);
        expect(result.querySelector('sup')).toBeNull();
    });
});
