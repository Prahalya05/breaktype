import { describe, expect, it } from 'vitest'
import { buildBreakSummary } from './breakSummary'
import type { TestSessionRecord } from '../storage/schema'

function round(wpm: number, accuracy: number, seconds: number): TestSessionRecord {
  return {
    id: crypto.randomUUID(),
    mode: 'time',
    config: { punctuation: false, numbers: false, durationSec: 30 },
    startedAt: 0,
    endedAt: seconds * 1000,
    keystrokes: [],
    result: { wpm, rawWpm: wpm, accuracy, consistency: 90, errorCount: 0, charCount: { correct: 1, incorrect: 0, extra: 0, missed: 0 } },
    source: 'break',
  }
}

describe('buildBreakSummary', () => {
  it('returns zeroed summary for no rounds', () => {
    expect(buildBreakSummary([])).toEqual({ totalRounds: 0, avgWpm: 0, avgAccuracy: 0, totalSeconds: 0 })
  })

  it('averages wpm/accuracy and sums elapsed time across rounds', () => {
    const rounds = [round(40, 90, 30), round(60, 95, 30), round(50, 100, 15)]
    const summary = buildBreakSummary(rounds)
    expect(summary.totalRounds).toBe(3)
    expect(summary.avgWpm).toBeCloseTo(50, 5)
    expect(summary.avgAccuracy).toBeCloseTo(95, 5)
    expect(summary.totalSeconds).toBeCloseTo(75, 5)
  })
})
