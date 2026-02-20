import { describe, it, expect } from 'vitest';
import { normalizeBold, splitProtectedSegments } from '../src/converter/postprocessor';

describe('normalizeBold', () => {
    it('Punctuation が隣接しない ** はそのまま保持する', () => {
        expect(normalizeBold('日本語**太字**です')).toBe('日本語**太字**です');
    });

    it('既に空白がある場合はそのまま保持する', () => {
        expect(normalizeBold('日本語 **太字** です')).toBe('日本語 **太字** です');
    });

    it('行頭の太字は変更しない', () => {
        expect(normalizeBold('**Bold** at start')).toBe('**Bold** at start');
    });

    it('行末の太字は変更しない', () => {
        expect(normalizeBold('at end **Bold**')).toBe('at end **Bold**');
    });

    it('Punctuation が隣接しない複数の太字スパンはそのまま保持する', () => {
        expect(normalizeBold('A**B**C**D**E')).toBe('A**B**C**D**E');
    });

    it('エスケープを解除して ** に復元する', () => {
        expect(normalizeBold('これは\\*\\*太字\\*\\*です')).toBe('これは**太字**です');
    });

    it('フェンスコードブロック内の太字は変換しない', () => {
        const input = '```\n日本語**太字**\n```';
        expect(normalizeBold(input)).toBe(input);
    });

    it('インラインコード内の太字は変換しない', () => {
        const input = 'text `日本語**太字**` text';
        expect(normalizeBold(input)).toBe(input);
    });

    it('インライン数式 $...$ 内の太字は変換しない', () => {
        const input = 'See $a**b**c$ for details';
        expect(normalizeBold(input)).toBe(input);
    });

    it('ブロック数式 $$...$$ 内の太字は変換しない', () => {
        const input = '\n$$\na**b**c\n$$';
        expect(normalizeBold(input)).toBe(input);
    });

    it('保護区間の外側の太字はそのまま保持する（Punctuation なし）', () => {
        const input = 'text `code` 日本語**太字**です';
        expect(normalizeBold(input)).toBe('text `code` 日本語**太字**です');
    });

    // Punctuation 隣接時のスペース挿入テスト
    const punctuationChars = ['。', '、', '？', '！', '”', '＃', '＆', '（', '）', '［', '］', '｛', '｝', '〈', '〉', '《', '》', '「', '」', '『', '』', '【', '】', '・', '…', '‥', '＠', '＿', '／', '＼', '：', '；', '＂', '＇', '＃', '％', '＊'];

    punctuationChars.forEach(punctuation => {
        it(`太字内容の末尾が Punctuation（${punctuation}）で直後が非空白・非 Punctuation ならスペースを挿入する`, () => {
            const input = `は**太字${punctuation}**または`;
            const expected = `は**太字${punctuation}** または`;
            expect(normalizeBold(input)).toBe(expected);
        });

        it(`太字内容の先頭が Punctuation（${punctuation}）で直前が非空白・非 Punctuation ならスペースを挿入する`, () => {
            const input = `テスト**${punctuation}太字**です`;
            const expected = `テスト **${punctuation}太字**です`;
            expect(normalizeBold(input)).toBe(expected);
        });

        it(`太字内容の先頭・末尾ともに Punctuation（${punctuation}）なら前後にスペースを挿入する`, () => {
            expect(normalizeBold(`テスト**${punctuation}太字${punctuation}**です`))
                .toBe(`テスト **${punctuation}太字${punctuation}** です`);
        });

        it('太字の内部に Punctuation があってもスペースを挿入しない', () => {
            expect(normalizeBold(`テスト**太字${punctuation}内**です`))
                .toBe(`テスト**太字${punctuation}内**です`);
        });

        it('太字内容の末尾が Punctuation でも直後が Punctuation なら挿入しない', () => {
            expect(normalizeBold(`は**確率密度関数${punctuation}**。`))
                .toBe(`は**確率密度関数${punctuation}**。`);
        });

        it('太字内容の末尾が Punctuation でも直後が空白なら挿入しない', () => {
            expect(normalizeBold(`は**確率密度関数${punctuation}** テスト`))
                .toBe(`は**確率密度関数${punctuation}** テスト`);
        });

        it('太字内容の先頭が Punctuation でも直前が Punctuation なら挿入しない', () => {
            expect(normalizeBold(`「**${punctuation}太字${punctuation}**です」`))
                .toBe(`「**${punctuation}太字${punctuation}** です」`);
        });

        it('複数の Punctuation 終端太字スパンを正しく処理する', () => {
            expect(normalizeBold(`は**確率密度関数${punctuation}**または離散なら**確率質量関数${punctuation}**です`))
                .toBe(`は**確率密度関数${punctuation}** または離散なら**確率質量関数${punctuation}** です`);
        });
    });

});

describe('splitProtectedSegments', () => {
    it('プレーンテキストは単一の非保護セグメントを返す', () => {
        const segments = splitProtectedSegments('hello world');
        expect(segments).toEqual([{ text: 'hello world', protected: false }]);
    });

    it('フェンスコードブロックを保護区間として識別する', () => {
        const segments = splitProtectedSegments('before\n```\ncode\n```\nafter');
        expect(segments.some(s => s.protected && s.text.includes('code'))).toBe(true);
        expect(segments.some(s => !s.protected && s.text.includes('before'))).toBe(true);
        expect(segments.some(s => !s.protected && s.text.includes('after'))).toBe(true);
    });

    it('インラインコードを保護区間として識別する', () => {
        const segments = splitProtectedSegments('before `code` after');
        expect(segments.some(s => s.protected && s.text === '`code`')).toBe(true);
    });

    it('インライン数式を保護区間として識別する', () => {
        const segments = splitProtectedSegments('before $x^2$ after');
        expect(segments.some(s => s.protected && s.text === '$x^2$')).toBe(true);
    });
});
