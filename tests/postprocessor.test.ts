import { describe, it, expect } from 'vitest'
import { normalizeBold, splitProtectedSegments } from '../src/converter/postprocessor'

describe('normalizeBold', () => {
  it('adds spaces around ** when adjacent to Japanese text', () => {
    expect(normalizeBold('日本語**重要**です')).toBe('日本語 **重要** です')
  })

  it('does not add double space when space already exists', () => {
    expect(normalizeBold('日本語 **重要** です')).toBe('日本語 **重要** です')
  })

  it('does not modify bold at start of line', () => {
    expect(normalizeBold('**Bold** at start')).toBe('**Bold** at start')
  })

  it('does not modify bold at end of line', () => {
    expect(normalizeBold('at end **Bold**')).toBe('at end **Bold**')
  })

  it('handles multiple bold spans on one line', () => {
    expect(normalizeBold('A**B**C**D**E')).toBe('A **B** C **D** E')
  })

  it('does not normalize bold inside fenced code block', () => {
    const input = '```\n日本語**重要**\n```'
    expect(normalizeBold(input)).toBe(input)
  })

  it('does not normalize bold inside inline code', () => {
    const input = 'text `日本語**重要**` text'
    expect(normalizeBold(input)).toBe(input)
  })

  it('does not normalize bold inside inline math $...$', () => {
    const input = 'See $a**b**c$ for details'
    expect(normalizeBold(input)).toBe(input)
  })

  it('does not normalize bold inside block math $$...$$', () => {
    const input = '\n$$\na**b**c\n$$'
    expect(normalizeBold(input)).toBe(input)
  })

  it('normalizes bold outside protected segments', () => {
    const input = 'text `code` 日本語**重要**です'
    expect(normalizeBold(input)).toBe('text `code` 日本語 **重要** です')
  })
})

describe('splitProtectedSegments', () => {
  it('returns single unprotected segment for plain text', () => {
    const segments = splitProtectedSegments('hello world')
    expect(segments).toEqual([{ text: 'hello world', protected: false }])
  })

  it('identifies fenced code block as protected', () => {
    const segments = splitProtectedSegments('before\n```\ncode\n```\nafter')
    expect(segments.some(s => s.protected && s.text.includes('code'))).toBe(true)
    expect(segments.some(s => !s.protected && s.text.includes('before'))).toBe(true)
    expect(segments.some(s => !s.protected && s.text.includes('after'))).toBe(true)
  })

  it('identifies inline code as protected', () => {
    const segments = splitProtectedSegments('before `code` after')
    expect(segments.some(s => s.protected && s.text === '`code`')).toBe(true)
  })

  it('identifies inline math as protected', () => {
    const segments = splitProtectedSegments('before $x^2$ after')
    expect(segments.some(s => s.protected && s.text === '$x^2$')).toBe(true)
  })
})
