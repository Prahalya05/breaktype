import { describe, expect, it } from 'vitest'
import { analyzePerFinger } from './perFingerStats'
import { createFreshDB } from '../../storage/schema'
import type { BreakTypeDB } from '../../storage/schema'
import type { FingerId } from '../../fingerMap/keyToFinger'

function dbWithFingerStats(stats: Partial<Record<FingerId, { attempts: number; correct: number }>>): BreakTypeDB {
  const db = createFreshDB()
  for (const [finger, agg] of Object.entries(stats)) {
    db.aggregates.perFinger[finger as FingerId] = { ...agg!, totalLatencyMs: 0 }
  }
  return db
}

describe('analyzePerFinger', () => {
  it('flags a finger with accuracy well below the mean as weak', () => {
    const db = dbWithFingerStats({
      'L-pinky': { attempts: 100, correct: 70 }, // 70% accuracy - clearly weak
      'L-index': { attempts: 100, correct: 98 },
      'R-index': { attempts: 100, correct: 97 },
      'R-pinky': { attempts: 100, correct: 96 },
    })
    const findings = analyzePerFinger(db)
    const weak = findings.find((f) => f.kind === 'weak-finger' && f.data.finger === 'L-pinky')
    expect(weak).toBeDefined()
  })

  it('flags a finger with accuracy well above the mean as a strength', () => {
    const db = dbWithFingerStats({
      'L-pinky': { attempts: 100, correct: 70 },
      'L-index': { attempts: 100, correct: 70 },
      'R-index': { attempts: 100, correct: 70 },
      'R-pinky': { attempts: 100, correct: 99 }, // clearly above the mean
    })
    const findings = analyzePerFinger(db)
    const strength = findings.find((f) => f.kind === 'strength-finger' && f.data.finger === 'R-pinky')
    expect(strength).toBeDefined()
  })

  it('does not flag anything when all fingers perform similarly', () => {
    const db = dbWithFingerStats({
      'L-pinky': { attempts: 50, correct: 47 },
      'L-index': { attempts: 50, correct: 48 },
      'R-index': { attempts: 50, correct: 47 },
      'R-pinky': { attempts: 50, correct: 48 },
    })
    expect(analyzePerFinger(db)).toEqual([])
  })

  it('ignores fingers below the minimum attempt threshold', () => {
    const db = dbWithFingerStats({
      'L-pinky': { attempts: 5, correct: 1 }, // would look terrible but sample too small
      'L-index': { attempts: 100, correct: 98 },
    })
    expect(analyzePerFinger(db)).toEqual([])
  })

  it('returns nothing with fewer than two eligible fingers', () => {
    const db = dbWithFingerStats({ 'L-pinky': { attempts: 100, correct: 50 } })
    expect(analyzePerFinger(db)).toEqual([])
  })
})
