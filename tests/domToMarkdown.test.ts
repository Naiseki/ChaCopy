import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { domToMarkdown } from '../src/converter/index';

const TEST_RES_DIR = path.resolve(import.meta.dirname, 'res/');

/**
 * HTML文字列を HTMLElement に変換する。
 * jsdom の document をグローバルに設定する必要がある (preprocessorで使用するため)
 */
function makeHTMLElement(html: string): HTMLElement {
    const dom = new JSDOM(`<div class="markdown prose">${html}</div>`);
    globalThis.document = dom.window.document as unknown as Document;
    globalThis.Node = dom.window.Node as unknown as typeof Node;
    return dom.window.document.querySelector('div') as HTMLElement;
}

describe('domToMarkdown ファイルベーステスト', () => {
    // test_res ディレクトリ内の .html ファイルを取得
    const files = fs.readdirSync(TEST_RES_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    it.each(htmlFiles)('ファイル %s が正しく変換されること', (htmlFile) => {
        const baseName = path.basename(htmlFile, '.html');
        const mdFile = `${baseName}.md`;

        const htmlPath = path.join(TEST_RES_DIR, htmlFile);
        const mdPath = path.join(TEST_RES_DIR, mdFile);

        if (!fs.existsSync(mdPath)) {
            throw new Error(`期待値ファイルが見つかりません: ${mdPath}`);
        }

        const inputHtml = fs.readFileSync(htmlPath, 'utf-8');
        const expectedMd = fs.readFileSync(mdPath, 'utf-8').replace(/\r\n/g, '\n').trim();

        const el = makeHTMLElement(inputHtml);
        const actualMd = domToMarkdown(el).trim();

        expect(actualMd).toBe(expectedMd);
    });
});
