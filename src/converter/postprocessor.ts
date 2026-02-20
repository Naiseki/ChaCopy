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
 * @param markdown - 処理対象の Markdown 文字列
 * @returns 太字が正規化された Markdown 文字列
 */
export function normalizeBold(markdown: string): string {
    const segments = splitProtectedSegments(markdown);

    return segments
        .map(({ text, protected: isProtected }) =>
            isProtected ? text : applyBoldNormalization(text)
        )
        .join('');
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

/**
 * テキストの太字マーカー（**）の前後に空白を挿入する。
 *
 * ** で分割し、開き/閉じを交互に判定することで、
 * 開き ** と閉じ ** を正しく区別する。
 *
 * @param text - 処理対象のテキスト
 * @returns 太字が正規化されたテキスト
 */
function applyBoldNormalization(text: string): string {
    // ** をエスケープ解除
    text = text.replace(/\\\*\\\*/g, '**');

    // ** で分割し、開き/閉じを交互に判定する
    const parts = text.split('**');
    if (parts.length < 3) return text; // 完全な太字スパンなし

    let result = '';
    let inBold = false;
    // スペースを追加しなくてよい文字（空白、改行）
    const noSpaceChars = /[\s\n]/;

    for (let i = 0; i < parts.length; i++) {
        if (i === 0) {
            result += parts[i];
            continue;
        }

        if (!inBold) {
            // 開き **: 直前が特定の文字以外なら空白を挿入
            if (result.length > 0 && !noSpaceChars.test(result.slice(-1))) {
                result += ' ';
            }
            result += '**';
            inBold = true;
        } else {
            // 閉じ **
            result += '**';
            const nextPart = parts[i];
            // 直後が特定の文字以外なら空白を挿入
            if (nextPart.length > 0 && !noSpaceChars.test(nextPart[0])) {
                result += ' ';
            }
            inBold = false;
        }

        result += parts[i];
    }

    return result;
}

