import type { FingerId } from '../../fingerMap/keyToFinger'
import type { BreakTypeDB } from '../../storage/schema'
import type { CoachFinding } from './types'

const MIN_ATTEMPTS = 30
const WEAK_THRESHOLD = 0.9 // accuracy below 90% of the mean counts as weak
const STRONG_THRESHOLD = 1.05

export function analyzePerFinger(db: BreakTypeDB): CoachFinding[] {
  const entries = Object.entries(db.aggregates.perFinger) as [FingerId, { attempts: number; correct: number }][]
  const eligible = entries.filter(([, agg]) => agg.attempts >= MIN_ATTEMPTS)
  if (eligible.length < 2) return []

  const accuracies = eligible.map(([, agg]) => agg.correct / agg.attempts)
  const meanAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length
  if (meanAccuracy === 0) return []

  const findings: CoachFinding[] = []
  for (const [finger, agg] of eligible) {
    const accuracy = agg.correct / agg.attempts
    if (accuracy < meanAccuracy * WEAK_THRESHOLD) {
      const gapPct = Math.round(((meanAccuracy - accuracy) / meanAccuracy) * 100)
      findings.push({
        kind: 'weak-finger',
        severity: Math.min(1, (gapPct / 100) * 2),
        data: { finger, accuracy, meanAccuracy, gapPct, attempts: agg.attempts },
      })
    } else if (accuracy > meanAccuracy * STRONG_THRESHOLD) {
      const gapPct = Math.round(((accuracy - meanAccuracy) / meanAccuracy) * 100)
      findings.push({
        kind: 'strength-finger',
        severity: Math.min(1, gapPct / 100),
        data: { finger, accuracy, meanAccuracy, gapPct, attempts: agg.attempts },
      })
    }
  }
  return findings
}
