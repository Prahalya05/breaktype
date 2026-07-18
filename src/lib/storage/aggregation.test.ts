import { describe, expect, it } from 'vitest'
import { addActiveMs, recordTestSession, testModeKey } from './aggregation'
import { createFreshDB } from './schema'
import type { KeystrokeEvent } from '../engine/types'
import type { TestSessionRecord } from './schema'

function keystroke(char: string, typed: string, correct: boolean, tMs: number): KeystrokeEvent {
  return { char, typed, correct, tMs, finger: undefined }
}

function makeSession(overrides: Partial<TestSessionRecord> = {}): TestSessionRecord {
  return {
    id: 'test-id',
    mode: 'words',
    config: { punctuation: false, numbers: false, wordCount: 10 },
    startedAt: 0,
    endedAt: 1000,
    keystrokes: [],
    result: { wpm: 50, rawWpm: 55, accuracy: 95, consistency: 90, errorCount: 1, charCount: { correct: 10, incorrect: 1, extra: 0, missed: 0 } },
    source: 'test',
    ...overrides,
  }
}

describe('recordTestSession', () => {
  it('folds keystrokes into perKey aggregates', () => {
    const db = createFreshDB()
    const keystrokes = [keystroke('a', 'a', true, 100), keystroke('b', 'x', false, 200)]
    const next = recordTestSession(db, makeSession({ keystrokes }), ['ab'], ['ax'])

    expect(next.aggregates.perKey['a']).toEqual({ attempts: 1, correct: 1, totalLatencyMs: 0 })
    expect(next.aggregates.perKey['b']).toEqual({ attempts: 1, correct: 0, totalLatencyMs: 0 })
  })

  it('records char-level substitutions for incorrect keystrokes', () => {
    const db = createFreshDB()
    const keystrokes = [keystroke('e', 'r', false, 100)]
    const next = recordTestSession(db, makeSession({ keystrokes }), ['e'], ['r'])

    expect(next.aggregates.substitutions['e>r']).toEqual({ count: 1 })
  })

  it('records word-level substitutions distinct from the typed word', () => {
    const db = createFreshDB()
    const next = recordTestSession(db, makeSession(), ['the'], ['teh'])
    expect(next.aggregates.wordSubstitutions['the>teh']).toEqual({ count: 1 })
  })

  it('tracks bigram latency only between consecutive correct keystrokes', () => {
    const db = createFreshDB()
    const keystrokes = [keystroke('t', 't', true, 0), keystroke('h', 'h', true, 120), keystroke('e', 'x', false, 200)]
    const next = recordTestSession(db, makeSession({ keystrokes }), ['the'], ['thx'])

    expect(next.aggregates.bigrams['th']).toEqual({ attempts: 1, correct: 1, totalLatencyMs: 120 })
    expect(next.aggregates.bigrams['he']).toBeUndefined()
  })

  it('caps recentTestSessions at the retention limit', () => {
    let db = createFreshDB()
    for (let i = 0; i < 55; i++) {
      db = recordTestSession(db, makeSession({ id: `s${i}` }), [], [])
    }
    expect(db.recentTestSessions.length).toBe(50)
    expect(db.recentTestSessions[0].id).toBe('s5')
  })

  it('updates personal best only when a new session beats it', () => {
    let db = createFreshDB()
    db = recordTestSession(db, makeSession({ result: { ...makeSession().result, wpm: 40 } }), [], [])
    const key = testModeKey(makeSession())
    expect(db.personalBests.byMode[key]).toBe(40)

    db = recordTestSession(db, makeSession({ result: { ...makeSession().result, wpm: 30 } }), [], [])
    expect(db.personalBests.byMode[key]).toBe(40)

    db = recordTestSession(db, makeSession({ result: { ...makeSession().result, wpm: 60 } }), [], [])
    expect(db.personalBests.byMode[key]).toBe(60)
  })
})

describe('addActiveMs', () => {
  it('accumulates active time under today\'s date key', () => {
    let db = createFreshDB()
    db = addActiveMs(db, 5000)
    db = addActiveMs(db, 3000)
    expect(db.dailyActiveTime).toHaveLength(1)
    expect(db.dailyActiveTime[0].activeMs).toBe(8000)
  })

  it('ignores non-positive durations', () => {
    const db = addActiveMs(createFreshDB(), 0)
    expect(db.dailyActiveTime).toHaveLength(0)
  })
})
