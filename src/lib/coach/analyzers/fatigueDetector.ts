import type { BreakTypeDB } from '../../storage/schema'
import type { CoachFinding } from './types'

const MIN_SESSION_SECONDS = 20
const MIN_KEYSTROKES = 15
const MIN_SESSIONS_TO_JUDGE = 3
const DROP_THRESHOLD = 0.08 // 8 percentage points
const MAJORITY_RATIO = 0.6

export function analyzeFatigue(db: BreakTypeDB): CoachFinding[] {
  const sessions = db.recentTestSessions.filter(
    (s) => (s.endedAt - s.startedAt) / 1000 >= MIN_SESSION_SECONDS && s.keystrokes.length >= MIN_KEYSTROKES,
  )
  if (sessions.length < MIN_SESSIONS_TO_JUDGE) return []

  let sessionsAffected = 0
  let totalDrop = 0

  for (const s of sessions) {
    const elapsedMs = s.endedAt - s.startedAt
    const thirdMs = elapsedMs / 3
    const firstThird = s.keystrokes.filter((k) => k.tMs < thirdMs)
    const lastThird = s.keystrokes.filter((k) => k.tMs >= 2 * thirdMs)
    if (firstThird.length < 5 || lastThird.length < 5) continue

    const firstAccuracy = firstThird.filter((k) => k.correct).length / firstThird.length
    const lastAccuracy = lastThird.filter((k) => k.correct).length / lastThird.length
    const drop = firstAccuracy - lastAccuracy
    if (drop > DROP_THRESHOLD) {
      sessionsAffected++
      totalDrop += drop
    }
  }

  const ratio = sessionsAffected / sessions.length
  if (ratio < MAJORITY_RATIO || sessionsAffected === 0) return []

  const avgDropPct = Math.round((totalDrop / sessionsAffected) * 100)
  return [
    {
      kind: 'fatigue',
      severity: Math.min(1, ratio),
      data: { avgDropPct, sessionsAffected, sessionsChecked: sessions.length },
    },
  ]
}
