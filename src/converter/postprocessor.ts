/**
 * Applies post-processing transformations to Markdown output from Turndown.
 *
 * Transformations:
 * 1. Bold normalization: ensure ** has whitespace on both sides
 *    (required for Japanese Markdown parsers)
 *
 * Skips transformations inside:
 * - Fenced code blocks (```...```)
 * - Inline code (`...`)
 * - Block math ($$...$$)
 * - Inline math ($...$)
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
    // Fenced code block: must start at beginning of line
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

    // Block math: $$...$$ at start of line
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

    // Inline code: `...`
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

    // Inline math: $...$ (not $$)
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

  // Flush remaining normal text
  if (normalStart < input.length) {
    segments.push({ text: input.slice(normalStart), protected: false })
  }

  return segments
}

function applyBoldNormalization(text: string): string {
  // Use lookbehind/lookahead to avoid consuming boundary characters,
  // which allows adjacent bold spans (e.g. A**B**C**D**E) to be handled correctly.

  // Step 1: add space before **...** when preceded by non-whitespace non-asterisk
  let result = text.replace(/(?<=[^\s*])(\*\*[^*\n]+?\*\*)/g, ' $1')
  // Step 2: add space after **...** when followed by non-whitespace non-asterisk
  result = result.replace(/(\*\*[^*\n]+?\*\*)(?=[^\s*])/g, '$1 ')
  return result
}
