import { describe, expect, it } from 'vitest'
import { computeAccuracy, computeRawWpm, computeWpm } from './metrics'

describe('computeWpm / computeRawWpm', () => {
  it('computes 60 wpm for 300 correct chars typed correctly in 60s', () => {
    const charCount = { correct: 300, incorrect: 0, extra: 0, missed: 0 }
    expect(computeWpm(charCount, 60)).toBeCloseTo(60, 5)
    expect(computeRawWpm(charCount, 60)).toBeCloseTo(60, 5)
  })

  it('raw wpm counts incorrect and extra chars too, actual wpm does not', () => {
    const charCount = { correct: 250, incorrect: 30, extra: 20, missed: 0 }
    expect(computeRawWpm(charCount, 60)).toBeCloseTo(300 / 5, 5)
    expect(computeWpm(charCount, 60)).toBeCloseTo(250 / 5, 5)
  })

  it('returns 0 when elapsed time is zero or negative', () => {
    const charCount = { correct: 10, incorrect: 0, extra: 0, missed: 0 }
    expect(computeWpm(charCount, 0)).toBe(0)
    expect(computeRawWpm(charCount, -5)).toBe(0)
  })
})

describe('computeAccuracy', () => {
  it('is 100 when nothing has been typed', () => {
    expect(computeAccuracy({ correct: 0, incorrect: 0, extra: 0, missed: 0 })).toBe(100)
  })

  it('computes percentage of correct over correct+incorrect+extra (missed excluded)', () => {
    expect(computeAccuracy({ correct: 90, incorrect: 10, extra: 0, missed: 5 })).toBeCloseTo(90, 5)
  })
})
