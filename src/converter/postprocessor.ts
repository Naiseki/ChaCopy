/**
 * Turndown 出力の Markdown に後処理を適用する。
 *
 * 変換内容:
 * 1. 太字正規化: ** の前後に空白を確保
 *    （日本語 Markdown パーサー向け）
 *
 * 以下の範囲では変換をスキップ:
 * - フェンスコードブロック (```...```)
 * - インラインコード (`...`)
 * - ブロック数式 ($$...$$)
 * - インライン数式 ($...$)
 */
export function postprocess(markdown: string): string {
  return normalizeBold(markdown)
}

export function normalizeBold(markdown: string): string {
  const segments = splitProtectedSegments(markdown)

  return segments
    .map(({ text, protected: isProtected }) =>
      isProtected ? text : applyBoldNormalization(text)
    )
    .join('')
}

type Segment = { text: string; protected: boolean }

export function splitProtectedSegments(input: string): Segment[] {
  const segments: Segment[] = []
  let pos = 0
  let normalStart = 0

  while (pos < input.length) {
    // フェンスコードブロック: 行頭で開始
    if (
      (pos === 0 || input[pos - 1] === '\n') &&
      input.startsWith('```', pos)
    ) {
      if (pos > normalStart) {
        segments.push({ text: input.slice(normalStart, pos), protected: false })
      }
      const closeIdx = input.indexOf('\n```', pos + 3)
      const closeEnd = closeIdx === -1 ? input.length : closeIdx + 4
      segments.push({ text: input.slice(pos, closeEnd), protected: true })
      pos = closeEnd
      normalStart = pos
      continue
    }

    // ブロック数式: 行頭の $$...$$
    if (
      (pos === 0 || input[pos - 1] === '\n') &&
      input.startsWith('$$', pos)
    ) {
      if (pos > normalStart) {
        segments.push({ text: input.slice(normalStart, pos), protected: false })
      }
      const closeIdx = input.indexOf('$$', pos + 2)
      const closeEnd = closeIdx === -1 ? input.length : closeIdx + 2
      segments.push({ text: input.slice(pos, closeEnd), protected: true })
      pos = closeEnd
      normalStart = pos
      continue
    }

    // インラインコード: `...`
    if (input[pos] === '`' && input[pos + 1] !== '`') {
      if (pos > normalStart) {
        segments.push({ text: input.slice(normalStart, pos), protected: false })
      }
      const closeIdx = input.indexOf('`', pos + 1)
      const closeEnd = closeIdx === -1 ? input.length : closeIdx + 1
      segments.push({ text: input.slice(pos, closeEnd), protected: true })
      pos = closeEnd
      normalStart = pos
      continue
    }

    // インライン数式: $...$ （$$ ではない）
    if (input[pos] === '$' && input[pos + 1] !== '$') {
      if (pos > normalStart) {
        segments.push({ text: input.slice(normalStart, pos), protected: false })
      }
      const closeIdx = input.indexOf('$', pos + 1)
      const closeEnd = closeIdx === -1 ? input.length : closeIdx + 1
      segments.push({ text: input.slice(pos, closeEnd), protected: true })
      pos = closeEnd
      normalStart = pos
      continue
    }

    pos++
  }

  // 残りの通常テキストを追加
  if (normalStart < input.length) {
    segments.push({ text: input.slice(normalStart), protected: false })
  }

  return segments
}

function applyBoldNormalization(text: string): string {
  text = text.replace(/\*\*/g, '**') // ** をエスケープ解除

  // ** で分割し、開き/閉じを交互に判定する。
  // regex と違い、開き ** と閉じ ** を正しく区別できる。
  const parts = text.split('**')
  if (parts.length < 3) return text // 完全な太字スパンなし

  let result = ''
  let inBold = false

  for (let i = 0; i < parts.length; i++) {
    if (i === 0) {
      result += parts[i]
      continue
    }

    if (!inBold) {
      // 開き **: 直前が非空白なら空白を挿入
      if (result.length > 0 && !/\s$/.test(result)) {
        result += ' '
      }
      result += '**'
      inBold = true
    } else {
      // 閉じ **: 直後が非空白なら空白を挿入
      result += '**'
      const nextPart = parts[i]
      if (nextPart.length > 0 && !/^\s/.test(nextPart)) {
        result += ' '
      }
      inBold = false
    }

    result += parts[i]
  }

  return result
}
