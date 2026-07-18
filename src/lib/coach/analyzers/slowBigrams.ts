import type { BreakTypeDB } from '../../storage/schema'
import type { CoachFinding } from './types'

const MIN_ATTEMPTS = 20
const SLOW_THRESHOLD = 1.5 // 50% slower than the user's global average
const MAX_FINDINGS = 5

export function analyzeSlowBigrams(db: BreakTypeDB): CoachFinding[] {
  const entries = Object.entries(db.aggregates.bigrams).filter(([, agg]) => agg.attempts >= MIN_ATTEMPTS)
  if (entries.length === 0) return []

  const totalLatency = entries.reduce((sum, [, agg]) => sum + agg.totalLatencyMs, 0)
  const totalAttempts = entries.reduce((sum, [, agg]) => sum + agg.attempts, 0)
  const globalAvgMs = totalLatency / totalAttempts
  if (globalAvgMs === 0) return []

  const findings: CoachFinding[] = []
  for (const [bigram, agg] of entries) {
    const avgMs = agg.totalLatencyMs / agg.attempts
    if (avgMs > globalAvgMs * SLOW_THRESHOLD) {
      const severity = Math.min(1, ((avgMs - globalAvgMs) / globalAvgMs) * (agg.attempts / 50))
      findings.push({ kind: 'slow-bigram', severity, data: { bigram, avgMs: Math.round(avgMs), globalAvgMs: Math.round(globalAvgMs), attempts: agg.attempts } })
    }
  }
  return findings.sort((a, b) => b.severity - a.severity).slice(0, MAX_FINDINGS)
}
