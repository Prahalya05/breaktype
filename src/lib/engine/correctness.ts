import type { CharCounts, CharStatus } from './types'

/**
 * Classifies each character position of a single word given what was typed.
 * `isPast` = the cursor has already moved on to a later word, so any characters
 * the user never got to are "missed" rather than merely "pending".
 */
export function classifyWordChars(expected: string, typed: string, isPast: boolean): CharStatus[] {
  const len = Math.max(expected.length, typed.length)
  const statuses: CharStatus[] = []
  for (let i = 0; i < len; i++) {
    if (i < expected.length && i < typed.length) {
      statuses.push(expected[i] === typed[i] ? 'correct' : 'incorrect')
    } else if (i >= expected.length) {
      statuses.push('extra')
    } else {
      statuses.push(isPast ? 'missed' : 'pending')
    }
  }
  return statuses
}

export function tallyWordChars(statuses: CharStatus[], into: CharCounts): CharCounts {
  for (const s of statuses) {
    if (s === 'correct') into.correct++
    else if (s === 'incorrect') into.incorrect++
    else if (s === 'extra') into.extra++
    else if (s === 'missed') into.missed++
  }
  return into
}

export function emptyCharCounts(): CharCounts {
  return { correct: 0, incorrect: 0, extra: 0, missed: 0 }
}

/**
 * Computes character counts across the whole test so far.
 * `typed[i]` is '' for words not yet reached. Words with index < cursorWordIdx
 * are "past" (any untyped trailing chars count as missed); the word at
 * cursorWordIdx is "current" (untyped trailing chars are just pending, not counted).
 */
export function computeCharCounts(words: string[], typed: string[], cursorWordIdx: number): CharCounts {
  const counts = emptyCharCounts()
  const lastWordIdx = Math.min(cursorWordIdx, words.length - 1)
  for (let i = 0; i <= lastWordIdx; i++) {
    const isPast = i < cursorWordIdx
    const wordTyped = typed[i] ?? ''
    if (!isPast && wordTyped.length === 0) continue
    const statuses = classifyWordChars(words[i], wordTyped, isPast)
    tallyWordChars(statuses, counts)
  }
  return counts
}
