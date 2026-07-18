import { describe, expect, it } from 'vitest'
import { runCoachAnalysis } from './runCoachAnalysis'
import { createFreshDB } from '../storage/schema'

describe('runCoachAnalysis', () => {
  it('reports insufficient data with an empty history', () => {
    const report = runCoachAnalysis(createFreshDB())
    expect(report.hasEnoughData).toBe(false)
    expect(report.findings).toEqual([])
    expect(report.tips).toEqual([])
  })

  it('produces a weak-finger tip with a deep link into a matching lesson', () => {
    const db = createFreshDB()
    db.recentTestSessions = [
      { id: '1', mode: 'time', config: { punctuation: false, numbers: false, durationSec: 30 }, startedAt: 0, endedAt: 30000, keystrokes: [], result: { wpm: 40, rawWpm: 40, accuracy: 90, consistency: 90, errorCount: 0, charCount: { correct: 1, incorrect: 0, extra: 0, missed: 0 } }, source: 'test' },
      { id: '2', mode: 'time', config: { punctuation: false, numbers: false, durationSec: 30 }, startedAt: 0, endedAt: 30000, keystrokes: [], result: { wpm: 40, rawWpm: 40, accuracy: 90, consistency: 90, errorCount: 0, charCount: { correct: 1, incorrect: 0, extra: 0, missed: 0 } }, source: 'test' },
      { id: '3', mode: 'time', config: { punctuation: false, numbers: false, durationSec: 30 }, startedAt: 0, endedAt: 30000, keystrokes: [], result: { wpm: 40, rawWpm: 40, accuracy: 90, consistency: 90, errorCount: 0, charCount: { correct: 1, incorrect: 0, extra: 0, missed: 0 } }, source: 'test' },
    ]
    db.aggregates.perFinger = {
      'L-pinky': { attempts: 100, correct: 70, totalLatencyMs: 0 },
      'L-index': { attempts: 100, correct: 98, totalLatencyMs: 0 },
      'R-index': { attempts: 100, correct: 97, totalLatencyMs: 0 },
      'R-pinky': { attempts: 100, correct: 96, totalLatencyMs: 0 },
    }

    const report = runCoachAnalysis(db)
    expect(report.hasEnoughData).toBe(true)
    const weakFingerTip = report.tips.find((t) => t.kind === 'weak-finger')
    expect(weakFingerTip).toBeDefined()
    expect(weakFingerTip?.linkTo).toMatch(/^\/practice\//)
  })
})
