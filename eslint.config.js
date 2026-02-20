import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,  // TS厳格ルール
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      semi: ['error', 'always'],  // セミコロン必須
      'semi-style': ['error', 'last'],  // 文末のみ
      '@typescript-eslint/no-non-null-assertion': 'off',  // !演算子を許可
      '@typescript-eslint/prefer-nullish-coalescing': 'error',  // ??推奨
    },
  },
];
