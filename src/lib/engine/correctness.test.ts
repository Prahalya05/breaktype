import { describe, expect, it } from 'vitest'
import { classifyWordChars, computeCharCounts } from './correctness'

describe('classifyWordChars', () => {
  it('marks matching chars correct', () => {
    expect(classifyWordChars('cat', 'cat', false)).toEqual(['correct', 'correct', 'correct'])
  })

  it('marks mismatches incorrect', () => {
    expect(classifyWordChars('cat', 'cbt', false)).toEqual(['correct', 'incorrect', 'correct'])
  })

  it('marks chars beyond word length as extra', () => {
    expect(classifyWordChars('cat', 'catss', false)).toEqual(['correct', 'correct', 'correct', 'extra', 'extra'])
  })

  it('marks untyped trailing chars as pending for the current word', () => {
    expect(classifyWordChars('cat', 'c', false)).toEqual(['correct', 'pending', 'pending'])
  })

  it('marks untyped trailing chars as missed for a past word', () => {
    expect(classifyWordChars('cat', 'c', true)).toEqual(['correct', 'missed', 'missed'])
  })
})

describe('computeCharCounts', () => {
  it('tallies correct/incorrect/extra/missed across past and current words', () => {
    const words = ['cat', 'dog', 'fish']
    const typed = ['cat', 'dg', 'fi']
    // word 0: past, fully correct -> 3 correct
    // word 1: past, 'dg' vs 'dog' -> d correct, g vs o incorrect, missing 'g' -> missed
    // word 2 (current, cursor): 'fi' vs 'fish' -> f correct, i correct, pending for rest (not counted)
    const counts = computeCharCounts(words, typed, 2)
    expect(counts).toEqual({ correct: 3 + 1 + 2, incorrect: 1, extra: 0, missed: 1 })
  })

  it('returns zero counts for an untouched test', () => {
    const counts = computeCharCounts(['cat', 'dog'], [], 0)
    expect(counts).toEqual({ correct: 0, incorrect: 0, extra: 0, missed: 0 })
  })
})
