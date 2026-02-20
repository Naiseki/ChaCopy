/**
 * Turndown 出力の Markdown に後処理を適用する。
 *
 * 変換内容:
 * 1. 太字正規化: CommonMark の delimiter run 判定が壊れる場合に ** の前後に空白を挿入
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
 * CommonMark では ** の開閉に left-flanking / right-flanking delimiter run の
 * 判定が使われる。太字内容の先頭・末尾が Punctuation Character の場合、
 * 外側が空白でも Punctuation でもないと delimiter run 条件が崩れるため、
 * その場合のみスペースを補間する。Punctuation が絡まないケースでは元の構造を保持する。
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
    // CommonMark Unicode punctuation character:
    // ASCII punctuation (U+0021–002F, U+003A–0040, U+005B–0060, U+007B–007E)
    // plus Unicode categories Pc, Pd, Pe, Pf, Pi, Po, Ps
    const punctRe = /[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\p{P}]/u;

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
                // 開き **: 太字内容の先頭が Punctuation で、
                // 直前が空白でも Punctuation でもない場合のみスペース挿入
                // （LF 条件2: "followed by punct → preceded by ws/punct" が崩れる場合の補正）
                const boldContent = parts[i];
                const lastChar = result.slice(-1);
                const firstBoldChar = boldContent[0] ?? '';
                if (
                    result.length > 0 &&
                    boldContent.length > 0 &&
                    punctRe.test(firstBoldChar) &&
                    !/\s/.test(lastChar) &&
                    !punctRe.test(lastChar)
                ) {
                    result += ' ';
                }
                result += '**';
                inBold = true;
            } else {
                // 閉じ **: 太字内容の末尾が Punctuation で、
                // 直後が空白でも Punctuation でもない場合のみスペース挿入
                // （RF 条件2: "preceded by punct → followed by ws/punct" が崩れる場合の補正）
                result += '**';
                const boldContent = parts[i - 1];
                const nextPart = parts[i];
                const lastBoldChar = boldContent.slice(-1);
                const firstNextChar = nextPart[0] ?? '';
                if (
                    boldContent.length > 0 &&
                    nextPart.length > 0 &&
                    punctRe.test(lastBoldChar) &&
                    !/\s/.test(firstNextChar) &&
                    !punctRe.test(firstNextChar)
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

