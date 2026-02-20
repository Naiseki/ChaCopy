/**
 * Turndown 出力の Markdown に後処理を適用する。
 *
 * 変換内容:
 * 1. 太字正規化: ** の前後に空白を確保（日本語 Markdown パーサー向け）
 *
 * @param markdown - Turndown の出力 Markdown 文字列
 * @returns 後処理済みの Markdown 文字列
 */
export function postprocess(markdown: string): string {
    return normalizeBold(markdown);
}

/**
 * Markdown の太字マーカー（**）の前後に空白を追加する。
 *
 * 以下の範囲では変換をスキップ:
 * - フェンスコードブロック (```...```)
 * - インラインコード (`...`)
 * - ブロック数式 ($$...$$)
 * - インライン数式 ($...$)
 *
 * 保護セグメントをまたぐ bold span（例: **`code` text**）も正しく処理するため、
 * inBold 状態をセグメント間で共有しながら一本のパスで処理する。
 *
 * @param markdown - 処理対象の Markdown 文字列
 * @returns 太字が正規化された Markdown 文字列
 */
export function normalizeBold(markdown: string): string {
    const segments = splitProtectedSegments(markdown);
    // 空白・改行・Markdown 特殊文字（*_~）に隣接する場合はスペース挿入不要
    const noAddSpace = /[\s\n*_~]/;

    let result = '';
    let inBold = false;

    for (const { text, protected: isProtected } of segments) {
        if (isProtected) {
            result += text;
            continue;
        }

        // エスケープ解除してから ** で分割
        const parts = text.replace(/\\\*\\\*/g, '**').split('**');

        for (let i = 0; i < parts.length; i++) {
            if (i === 0) {
                result += parts[i];
                continue;
            }

            if (!inBold) {
                // 開き **: 以下の場合のみ前にスペースを挿入
                //   - result が空でない
                //   - 直前が非スペース非特殊文字
                //   - bold の内容が空でない（**** のような空 bold を跨ぐ場合を除外）
                const boldContent = parts[i];
                if (
                    result.length > 0 &&
                    boldContent.length > 0 &&
                    !noAddSpace.test(result.slice(-1))
                ) {
                    result += ' ';
                }
                result += '**';
                inBold = true;
            } else {
                // 閉じ **: 以下の場合のみ後にスペースを挿入
                //   - bold の内容が空でない（**** のような空 bold を跨ぐ場合を除外）
                //   - 直後が非スペース非特殊文字
                result += '**';
                const boldContent = parts[i - 1];
                const nextPart = parts[i];
                if (
                    boldContent.length > 0 &&
                    nextPart.length > 0 &&
                    !noAddSpace.test(nextPart[0])
                ) {
                    result += ' ';
                }
                inBold = false;
            }

            result += parts[i];
        }
    }

    return result;
}

type Segment = { text: string; protected: boolean }

/**
 * Markdown 文字列を保護区間と通常区間に分割する。
 *
 * 保護区間（変換対象外）:
 * - フェンスコードブロック (```...```)
 * - インラインコード (`...`)
 * - ブロック数式 ($$...$$)
 * - インライン数式 ($...$)
 *
 * @param input - 分割対象の Markdown 文字列
 * @returns 保護区間フラグ付きセグメントの配列
 */
export function splitProtectedSegments(input: string): Segment[] {
    const segments: Segment[] = [];
    let pos = 0;
    let normalStart = 0;

    while (pos < input.length) {
        // フェンスコードブロック: 行頭で開始
        if (
            (pos === 0 || input[pos - 1] === '\n') &&
            input.startsWith('```', pos)
        ) {
            if (pos > normalStart) {
                segments.push({ text: input.slice(normalStart, pos), protected: false });
            }
            const closeIdx = input.indexOf('\n```', pos + 3);
            const closeEnd = closeIdx === -1 ? input.length : closeIdx + 4;
            segments.push({ text: input.slice(pos, closeEnd), protected: true });
            pos = closeEnd;
            normalStart = pos;
            continue;
        }

        // ブロック数式: 行頭の $$...$$
        if (
            (pos === 0 || input[pos - 1] === '\n') &&
            input.startsWith('$$', pos)
        ) {
            if (pos > normalStart) {
                segments.push({ text: input.slice(normalStart, pos), protected: false });
            }
            const closeIdx = input.indexOf('$$', pos + 2);
            const closeEnd = closeIdx === -1 ? input.length : closeIdx + 2;
            segments.push({ text: input.slice(pos, closeEnd), protected: true });
            pos = closeEnd;
            normalStart = pos;
            continue;
        }

        // インラインコード: `...`
        if (input[pos] === '`' && input[pos + 1] !== '`') {
            if (pos > normalStart) {
                segments.push({ text: input.slice(normalStart, pos), protected: false });
            }
            const closeIdx = input.indexOf('`', pos + 1);
            const closeEnd = closeIdx === -1 ? input.length : closeIdx + 1;
            segments.push({ text: input.slice(pos, closeEnd), protected: true });
            pos = closeEnd;
            normalStart = pos;
            continue;
        }

        // インライン数式: $...$ （$$ ではない）
        if (input[pos] === '$' && input[pos + 1] !== '$') {
            if (pos > normalStart) {
                segments.push({ text: input.slice(normalStart, pos), protected: false });
            }
            const closeIdx = input.indexOf('$', pos + 1);
            const closeEnd = closeIdx === -1 ? input.length : closeIdx + 1;
            segments.push({ text: input.slice(pos, closeEnd), protected: true });
            pos = closeEnd;
            normalStart = pos;
            continue;
        }

        pos++;
    }

    // 残りの通常テキストを追加
    if (normalStart < input.length) {
        segments.push({ text: input.slice(normalStart), protected: false });
    }

    return segments;
}

