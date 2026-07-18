import type { BreakTypeDB } from '../../storage/schema'
import type { CoachFinding } from './types'

const MIN_CHAR_COUNT = 5
const MIN_WORD_COUNT = 3
const MAX_FINDINGS_PER_TYPE = 5

export function analyzeSubstitutions(db: BreakTypeDB): CoachFinding[] {
  const findings: CoachFinding[] = []

  const charSubs = Object.entries(db.aggregates.substitutions)
    .filter(([, agg]) => agg.count >= MIN_CHAR_COUNT)
    .map(([key, agg]) => {
      const [expected, actual] = key.split('>')
      return { kind: 'substitution' as const, severity: Math.min(1, agg.count / 20), data: { expected, actual, count: agg.count } }
    })
    .sort((a, b) => b.severity - a.severity)
    .slice(0, MAX_FINDINGS_PER_TYPE)

  const wordSubs = Object.entries(db.aggregates.wordSubstitutions)
    .filter(([, agg]) => agg.count >= MIN_WORD_COUNT)
    .map(([key, agg]) => {
      const [expected, actual] = key.split('>')
      return { kind: 'word-substitution' as const, severity: Math.min(1, agg.count / 10), data: { expected, actual, count: agg.count } }
    })
    .sort((a, b) => b.severity - a.severity)
    .slice(0, MAX_FINDINGS_PER_TYPE)

  findings.push(...charSubs, ...wordSubs)
  return findings
}
