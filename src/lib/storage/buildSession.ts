import type { KeystrokeEvent, TestConfig, TestResult } from '../engine/types'
import type { TestSessionRecord } from './schema'

export function buildTestSessionRecord(
  result: TestResult,
  config: TestConfig,
  keystrokeLog: KeystrokeEvent[],
  source: 'test' | 'break' = 'test',
): TestSessionRecord {
  const endedAt = Date.now()
  return {
    id: crypto.randomUUID(),
    mode: config.mode.type,
    config: {
      punctuation: config.punctuation,
      numbers: config.numbers,
      wordCount: config.mode.type === 'words' ? config.mode.count : undefined,
      durationSec: config.mode.type === 'time' ? config.mode.seconds : undefined,
    },
    startedAt: endedAt - result.elapsedSeconds * 1000,
    endedAt,
    keystrokes: keystrokeLog,
    result: {
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      errorCount: result.errorCount,
      charCount: result.charCount,
    },
    source,
  }
}
