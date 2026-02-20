import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

let _service: TurndownService | null = null;

/**
 * Turndown の設定済みシングルトンインスタンスを取得する。
 *
 * 初回呼び出し時に以下を設定:
 * 1. GFM プラグイン: テーブルと取消線対応
 * 2. カスタムルール「chappymd-math」: 数式プレースホルダを保護（エスケープしない）
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
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        fence: '```',
        strongDelimiter: '**',
        emDelimiter: '*',
    });

    // GFM プラグイン: テーブル (| col | col |) と取消線を追加
    service.use(gfm);

    // 数式パススルールール: textContent をエスケープせずそのまま返す。
    // gfm より後に追加することで優先度が高くなる。
    service.addRule('chappymd-math', {
        filter(node) {
            return (
                node.nodeName === 'SPAN' &&
                (node as Element).hasAttribute('data-chappymd-math')
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

    _service = service;
    return service;
}
