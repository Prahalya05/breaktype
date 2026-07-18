import type { FingerId } from '../fingerMap/keyToFinger'
import type { KeystrokeEvent, TestConfig } from '../engine/types'

export const SCHEMA_VERSION = 1

export interface TestSessionRecord {
  id: string
  mode: 'words' | 'time'
  config: Pick<TestConfig, 'punctuation' | 'numbers'> & { wordCount?: number; durationSec?: number }
  startedAt: number
  endedAt: number
  keystrokes: KeystrokeEvent[]
  result: {
    wpm: number
    rawWpm: number
    accuracy: number
    consistency: number
    errorCount: number
    charCount: { correct: number; incorrect: number; extra: number; missed: number }
  }
  source: 'test' | 'break'
}

export interface LessonSessionRecord {
  id: string
  lessonId: string
  startedAt: number
  endedAt: number
  keystrokes: KeystrokeEvent[]
  result: { accuracy: number; wpm: number; errorCount: number }
}

export interface KeyAggregate {
  attempts: number
  correct: number
  totalLatencyMs: number
}

export type FingerAggregate = KeyAggregate

export interface BigramAggregate {
  attempts: number
  correct: number
  totalLatencyMs: number
}

export interface SubstitutionAggregate {
  count: number
}

export interface DailyActiveTime {
  dateKey: string
  activeMs: number
}

export interface PersonalBests {
  byMode: Record<string, number>
}

export interface LessonProgress {
  unlocked: boolean
  bestAccuracy: number
  bestWpm: number
  completedAt?: number
}

export interface BreakTypeSettings {
  defaultPunctuation: boolean
  defaultNumbers: boolean
  defaultWordMode: { type: 'words'; count: number } | { type: 'time'; seconds: number }
}

export interface BreakTypeDB {
  schemaVersion: number
  createdAt: number

  recentTestSessions: TestSessionRecord[]
  recentLessonSessions: LessonSessionRecord[]

  aggregates: {
    perKey: Record<string, KeyAggregate>
    perFinger: Partial<Record<FingerId, FingerAggregate>>
    bigrams: Record<string, BigramAggregate>
    substitutions: Record<string, SubstitutionAggregate>
    wordSubstitutions: Record<string, SubstitutionAggregate>
  }

  dailyActiveTime: DailyActiveTime[]
  personalBests: PersonalBests
  lessonProgress: Record<string, LessonProgress>
  settings: BreakTypeSettings
}

export const RECENT_TEST_SESSIONS_CAP = 50
export const RECENT_LESSON_SESSIONS_CAP = 100
export const DAILY_ACTIVE_TIME_CAP = 365

export function createFreshDB(): BreakTypeDB {
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: Date.now(),
    recentTestSessions: [],
    recentLessonSessions: [],
    aggregates: {
      perKey: {},
      perFinger: {},
      bigrams: {},
      substitutions: {},
      wordSubstitutions: {},
    },
    dailyActiveTime: [],
    personalBests: { byMode: {} },
    lessonProgress: {},
    settings: {
      defaultPunctuation: false,
      defaultNumbers: false,
      defaultWordMode: { type: 'time', seconds: 30 },
    },
  }
}
