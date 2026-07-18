import type { BreakTypeDB } from '../storage/schema'
import { analyzePerFinger } from './analyzers/perFingerStats'
import { analyzeWeakKeys } from './analyzers/weakKeyDetector'
import { analyzeSubstitutions } from './analyzers/substitutionPairs'
import { analyzeFatigue } from './analyzers/fatigueDetector'
import { analyzeSlowBigrams } from './analyzers/slowBigrams'
import { generateTips, type CoachTip } from './tipGenerator'
import type { CoachFinding } from './analyzers/types'

export interface CoachReport {
  findings: CoachFinding[]
  tips: CoachTip[]
  hasEnoughData: boolean
}

const MIN_SESSIONS_FOR_COACH = 3

export function runCoachAnalysis(db: BreakTypeDB): CoachReport {
  const totalSessions = db.recentTestSessions.length + db.recentLessonSessions.length
  if (totalSessions < MIN_SESSIONS_FOR_COACH) {
    return { findings: [], tips: [], hasEnoughData: false }
  }

  const findings: CoachFinding[] = [
    ...analyzePerFinger(db),
    ...analyzeWeakKeys(db),
    ...analyzeSubstitutions(db),
    ...analyzeFatigue(db),
    ...analyzeSlowBigrams(db),
  ]

  return { findings, tips: generateTips(findings), hasEnoughData: true }
}
