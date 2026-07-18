import type { FingerId } from '../fingerMap/keyToFinger'

export type TestMode = { type: 'words'; count: number } | { type: 'time'; seconds: number }

export interface TestConfig {
  mode: TestMode
  punctuation: boolean
  numbers: boolean
}

export type CharStatus = 'correct' | 'incorrect' | 'extra' | 'missed' | 'pending'

export interface KeystrokeEvent {
  char: string
  typed: string | null
  correct: boolean
  tMs: number
  finger?: FingerId
}

export interface CharCounts {
  correct: number
  incorrect: number
  extra: number
  missed: number
}

export interface TestResult {
  wpm: number
  rawWpm: number
  accuracy: number
  consistency: number
  errorCount: number
  charCount: CharCounts
  elapsedSeconds: number
}

export type EngineStatus = 'idle' | 'running' | 'finished'
