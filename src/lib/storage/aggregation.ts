import type { KeystrokeEvent } from '../engine/types'
import { todayDateKey } from '../utils/time'
import {
  DAILY_ACTIVE_TIME_CAP,
  RECENT_TEST_SESSIONS_CAP,
  RECENT_LESSON_SESSIONS_CAP,
  type BreakTypeDB,
  type KeyAggregate,
  type LessonSessionRecord,
  type TestSessionRecord,
} from './schema'

function bumpAgg(map: Record<string, KeyAggregate>, key: string, correct: boolean, latencyMs?: number): void {
  const agg = map[key] ?? { attempts: 0, correct: 0, totalLatencyMs: 0 }
  agg.attempts += 1
  if (correct) agg.correct += 1
  if (latencyMs !== undefined) agg.totalLatencyMs += latencyMs
  map[key] = agg
}

function cloneAggregates(db: BreakTypeDB): BreakTypeDB['aggregates'] {
  return {
    perKey: { ...db.aggregates.perKey },
    perFinger: { ...db.aggregates.perFinger },
    bigrams: { ...db.aggregates.bigrams },
    substitutions: { ...db.aggregates.substitutions },
    wordSubstitutions: { ...db.aggregates.wordSubstitutions },
  }
}

/** Folds a session's raw keystrokes into the unbounded rolling aggregates (O(chars), not O(history)). */
function foldKeystrokes(aggregates: BreakTypeDB['aggregates'], keystrokes: KeystrokeEvent[]): void {
  let prevCorrectChar: string | null = null
  let prevCorrectTMs: number | null = null

  for (const k of keystrokes) {
    bumpAgg(aggregates.perKey, k.char, k.correct)
    if (k.finger) {
      bumpAgg(aggregates.perFinger as Record<string, KeyAggregate>, k.finger, k.correct)
    }
    if (!k.correct && k.typed) {
      const subKey = `${k.char}>${k.typed}`
      const sub = aggregates.substitutions[subKey] ?? { count: 0 }
      sub.count += 1
      aggregates.substitutions[subKey] = sub
    }

    if (k.correct) {
      if (prevCorrectChar !== null && prevCorrectTMs !== null) {
        const bigram = prevCorrectChar + k.char
        bumpAgg(aggregates.bigrams, bigram, true, k.tMs - prevCorrectTMs)
      }
      prevCorrectChar = k.char
      prevCorrectTMs = k.tMs
    } else {
      prevCorrectChar = null
      prevCorrectTMs = null
    }
  }
}

/** Catches transposition-style typos (e.g. "teh" for "the") that char-level substitutions miss. */
function foldWordErrors(aggregates: BreakTypeDB['aggregates'], words: string[], typed: string[]): void {
  for (let i = 0; i < typed.length; i++) {
    const expected = words[i]
    const actual = typed[i]
    if (!expected || !actual || actual.length === 0 || actual === expected) continue
    const key = `${expected}>${actual}`
    const sub = aggregates.wordSubstitutions[key] ?? { count: 0 }
    sub.count += 1
    aggregates.wordSubstitutions[key] = sub
  }
}

export function testModeKey(session: Pick<TestSessionRecord, 'mode' | 'config'>): string {
  const size = session.mode === 'words' ? session.config.wordCount : session.config.durationSec
  return `${session.mode}:${size}:${session.config.punctuation}:${session.config.numbers}`
}

export function recordTestSession(db: BreakTypeDB, session: TestSessionRecord, words: string[], typed: string[]): BreakTypeDB {
  const aggregates = cloneAggregates(db)
  foldKeystrokes(aggregates, session.keystrokes)
  foldWordErrors(aggregates, words, typed)

  const recentTestSessions = [...db.recentTestSessions, session].slice(-RECENT_TEST_SESSIONS_CAP)

  const modeKey = testModeKey(session)
  const prevBest = db.personalBests.byMode[modeKey] ?? 0
  const personalBests =
    session.result.wpm > prevBest
      ? { byMode: { ...db.personalBests.byMode, [modeKey]: session.result.wpm } }
      : db.personalBests

  return { ...db, aggregates, recentTestSessions, personalBests }
}

export function recordLessonSession(db: BreakTypeDB, session: LessonSessionRecord): BreakTypeDB {
  const aggregates = cloneAggregates(db)
  foldKeystrokes(aggregates, session.keystrokes)

  const recentLessonSessions = [...db.recentLessonSessions, session].slice(-RECENT_LESSON_SESSIONS_CAP)

  const prev = db.lessonProgress[session.lessonId]
  const lessonProgress = {
    ...db.lessonProgress,
    [session.lessonId]: {
      unlocked: true,
      bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, session.result.accuracy),
      bestWpm: Math.max(prev?.bestWpm ?? 0, session.result.wpm),
      completedAt: Date.now(),
    },
  }

  return { ...db, aggregates, recentLessonSessions, lessonProgress }
}

export function addActiveMs(db: BreakTypeDB, ms: number): BreakTypeDB {
  if (ms <= 0) return db
  const dateKey = todayDateKey()
  const daily = [...db.dailyActiveTime]
  const idx = daily.findIndex((d) => d.dateKey === dateKey)
  if (idx >= 0) {
    daily[idx] = { ...daily[idx], activeMs: daily[idx].activeMs + ms }
  } else {
    daily.push({ dateKey, activeMs: ms })
  }
  return { ...db, dailyActiveTime: daily.slice(-DAILY_ACTIVE_TIME_CAP) }
}
