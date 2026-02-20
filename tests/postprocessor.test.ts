import { describe, it, expect } from 'vitest';
import { normalizeBold, splitProtectedSegments } from '../src/converter/postprocessor';

describe('normalizeBold', () => {
    it('日本語に隣接する ** の前後に空白を追加する', () => {
        expect(normalizeBold('日本語**重要**です')).toBe('日本語 **重要** です');
    });

    it('既に空白がある場合は二重に追加しない', () => {
        expect(normalizeBold('日本語 **重要** です')).toBe('日本語 **重要** です');
    });

    it('行頭の太字は変更しない', () => {
        expect(normalizeBold('**Bold** at start')).toBe('**Bold** at start');
    });

    it('行末の太字は変更しない', () => {
        expect(normalizeBold('at end **Bold**')).toBe('at end **Bold**');
    });

    it('複数の太字スパンを正しく処理する', () => {
        expect(normalizeBold('A**B**C**D**E')).toBe('A **B** C **D** E');
    });

    it('エスケープを正しく処理する', () => {
        expect(normalizeBold('これは\\*\\*太字\\*\\*です')).toBe('これは **太字** です');
    });

    it('フェンスコードブロック内の太字は変換しない', () => {
        const input = '```\n日本語**重要**\n```';
        expect(normalizeBold(input)).toBe(input);
    });

    it('インラインコード内の太字は変換しない', () => {
        const input = 'text `日本語**重要**` text';
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

    it('保護区間の外側の太字のみ正規化する', () => {
        const input = 'text `code` 日本語**重要**です';
        expect(normalizeBold(input)).toBe('text `code` 日本語 **重要** です');
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
