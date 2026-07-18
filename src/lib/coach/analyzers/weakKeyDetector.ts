import type { BreakTypeDB } from '../../storage/schema'
import type { CoachFinding } from './types'

const MIN_ATTEMPTS = 15
const WEAK_THRESHOLD = 0.85

export function analyzeWeakKeys(db: BreakTypeDB): CoachFinding[] {
  const entries = Object.entries(db.aggregates.perKey).filter(([, agg]) => agg.attempts >= MIN_ATTEMPTS)
  if (entries.length === 0) return []

  const totalCorrect = entries.reduce((sum, [, agg]) => sum + agg.correct, 0)
  const totalAttempts = entries.reduce((sum, [, agg]) => sum + agg.attempts, 0)
  const globalAccuracy = totalCorrect / totalAttempts
  if (globalAccuracy === 0) return []

  const findings: CoachFinding[] = []
  for (const [key, agg] of entries) {
    const accuracy = agg.correct / agg.attempts
    if (accuracy < globalAccuracy * WEAK_THRESHOLD) {
      // Actionability-weighted: a frequently-typed weak key ranks above a rarely-typed one.
      const severity = (1 - accuracy) * Math.min(1, agg.attempts / 100)
      findings.push({ kind: 'weak-key', severity, data: { key, accuracy, attempts: agg.attempts, globalAccuracy } })
    }
  }
  return findings.sort((a, b) => b.severity - a.severity)
}
