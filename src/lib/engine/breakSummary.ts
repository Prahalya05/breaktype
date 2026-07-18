import type { TestSessionRecord } from '../storage/schema'

export interface BreakSummary {
  totalRounds: number
  avgWpm: number
  avgAccuracy: number
  totalSeconds: number
}

export function buildBreakSummary(rounds: TestSessionRecord[]): BreakSummary {
  if (rounds.length === 0) {
    return { totalRounds: 0, avgWpm: 0, avgAccuracy: 0, totalSeconds: 0 }
  }
  const totalSeconds = rounds.reduce((sum, r) => sum + (r.endedAt - r.startedAt) / 1000, 0)
  const avgWpm = rounds.reduce((sum, r) => sum + r.result.wpm, 0) / rounds.length
  const avgAccuracy = rounds.reduce((sum, r) => sum + r.result.accuracy, 0) / rounds.length
  return { totalRounds: rounds.length, avgWpm, avgAccuracy, totalSeconds }
}
