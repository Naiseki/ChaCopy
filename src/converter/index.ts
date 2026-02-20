import { preprocessNode } from './preprocessor';
import { getTurndownService } from './turndown-setup';
import { postprocess } from './postprocessor';

/**
 * ChatGPT メッセージの DOM ノードを Markdown に変換する。
 *
 * 3段階のパイプライン処理を行う:
 * 1. 前処理（preprocessor）: ChatGPT DOM を擬似HTML に変換
 * 2. Turndown: HTML を Markdown に変換
 * 3. 後処理（postprocessor）: Markdown を整形
 *
 * 元のノードは変更しない（読み取り専用）。
 *
 * @param contentNode - 変換対象の DOM ノード
 * @returns クリーンな Markdown 文字列
 */
export function domToMarkdown(contentNode: HTMLElement): string {
    const processedNode = preprocessNode(contentNode);
    const service = getTurndownService();
    const rawMarkdown = service.turndown(processedNode);
    return postprocess(rawMarkdown);
}
