import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

let _service: TurndownService | null = null;

/**
 * Turndown の設定済みシングルトンインスタンスを取得する。
 *
 * 初回呼び出し時に以下を設定:
 * 1. GFM プラグイン: テーブルと取消線対応
 * 2. カスタムルール「chacopy-math」: 数式プレースホルダを保護（エスケープしない）
 * 3. カスタムルール「linebreak」: <br> を改行に変換
 *
 * 以降の呼び出しキャッシュされたインスタンスを返す（シングルトン）。
 *
 * @returns 設定済みの TurndownService インスタンス
 */
export function getTurndownService(): TurndownService {
    if (_service) return _service;

    const service = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        fence: '```',
        strongDelimiter: '**',
        emDelimiter: '_',
    });

    // GFM プラグイン: テーブル (| col | col |) と取消線を追加
    service.use(gfm);

    // 数式パススルールール: textContent をエスケープせずそのまま返す。
    // gfm より後に追加することで優先度が高くなる。
    service.addRule('chacopy-math', {
        filter(node) {
            return (
                node.nodeName === 'SPAN' &&
                (node as Element).hasAttribute('data-chacopy-math')
            );
        },
        replacement(_content, node) {
            return (node as Element).textContent ?? '';
        },
    });

    // <br> を改行に変換
    service.addRule('linebreak', {
        filter: ['br'],
        replacement() {
            return '\n';
        },
    });

    // <del> の二重チルダ: GFM プラグインが単一 ~ を使う場合に上書きする
    service.addRule('strikethrough-double', {
        filter: ['del', 's'],
        replacement(content) {
            return `~~${content}~~`;
        },
    });

    // チェックボックス: <input type="checkbox"> を [x] / [ ] に変換
    service.addRule('checkbox', {
        filter(node) {
            return (
                node.nodeName === 'INPUT' &&
                (node as HTMLInputElement).type === 'checkbox'
            );
        },
        replacement(_content, node) {
            return (node as HTMLInputElement).checked ? '[x] ' : '[ ] ';
        },
    });

    // エスケープを無効化（バックスラッシュを挿入しない）
    service.escape = (str: string) => str;

    _service = service;
    return service;
}
