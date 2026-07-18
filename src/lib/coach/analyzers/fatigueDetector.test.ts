import { describe, expect, it } from 'vitest'
import { analyzeFatigue } from './fatigueDetector'
import { createFreshDB } from '../../storage/schema'
import type { KeystrokeEvent } from '../../engine/types'
import type { TestSessionRecord } from '../../storage/schema'

function makeKeystrokes(count: number, correctFn: (i: number, tMs: number) => boolean, totalMs: number): KeystrokeEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const tMs = (i / count) * totalMs
    return { char: 'a', typed: 'a', correct: correctFn(i, tMs), tMs, finger: undefined }
  })
}

function fatiguedSession(id: string): TestSessionRecord {
  const totalMs = 30000
  // First third: all correct. Last third: mostly wrong -> clear fatigue signal.
  const keystrokes = makeKeystrokes(30, (i, tMs) => (tMs < totalMs / 3 ? true : tMs < (2 * totalMs) / 3 ? true : i % 4 !== 0), totalMs)
  return {
    id,
    mode: 'time',
    config: { punctuation: false, numbers: false, durationSec: 30 },
    startedAt: 0,
    endedAt: totalMs,
    keystrokes,
    result: { wpm: 40, rawWpm: 42, accuracy: 90, consistency: 80, errorCount: 3, charCount: { correct: 27, incorrect: 3, extra: 0, missed: 0 } },
    source: 'test',
  }
}

function steadySession(id: string): TestSessionRecord {
  const totalMs = 30000
  const keystrokes = makeKeystrokes(30, () => true, totalMs)
  return {
    id,
    mode: 'time',
    config: { punctuation: false, numbers: false, durationSec: 30 },
    startedAt: 0,
    endedAt: totalMs,
    keystrokes,
    result: { wpm: 50, rawWpm: 50, accuracy: 100, consistency: 100, errorCount: 0, charCount: { correct: 30, incorrect: 0, extra: 0, missed: 0 } },
    source: 'test',
  }
}

describe('analyzeFatigue', () => {
  it('flags fatigue when a majority of recent sessions show an accuracy drop', () => {
    const db = createFreshDB()
    db.recentTestSessions = [fatiguedSession('1'), fatiguedSession('2'), fatiguedSession('3'), steadySession('4')]
    const findings = analyzeFatigue(db)
    expect(findings).toHaveLength(1)
    expect(findings[0].kind).toBe('fatigue')
    expect(findings[0].data.sessionsAffected).toBe(3)
  })

  it('does not flag fatigue when sessions are steady', () => {
    const db = createFreshDB()
    db.recentTestSessions = [steadySession('1'), steadySession('2'), steadySession('3')]
    expect(analyzeFatigue(db)).toEqual([])
  })

  it('does not flag fatigue with too few qualifying sessions', () => {
    const db = createFreshDB()
    db.recentTestSessions = [fatiguedSession('1'), fatiguedSession('2')]
    expect(analyzeFatigue(db)).toEqual([])
  })
})
