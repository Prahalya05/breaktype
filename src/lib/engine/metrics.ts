import type { CharCounts, KeystrokeEvent } from './types'

/** Raw WPM counts every typed character (correct, incorrect, and extra), 5 chars = 1 word. */
export function computeRawWpm(charCount: CharCounts, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0
  const totalTyped = charCount.correct + charCount.incorrect + charCount.extra
  return (totalTyped / 5) / (elapsedSeconds / 60)
}

/** Actual WPM only counts correctly typed characters. */
export function computeWpm(charCount: CharCounts, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0
  return (charCount.correct / 5) / (elapsedSeconds / 60)
}

export function computeAccuracy(charCount: CharCounts): number {
  const total = charCount.correct + charCount.incorrect + charCount.extra
  if (total === 0) return 100
  return (charCount.correct / total) * 100
}

/**
 * 100 - coefficient-of-variation(%) of per-second WPM, clamped to [0,100].
 * Lower variance in typing speed across the test -> higher consistency score.
 */
export function computeConsistency(keystrokeLog: KeystrokeEvent[], elapsedSeconds: number): number {
  if (elapsedSeconds < 1 || keystrokeLog.length < 2) return 100

  const bucketCount = Math.max(1, Math.ceil(elapsedSeconds))
  const buckets = new Array<number>(bucketCount).fill(0)
  for (const k of keystrokeLog) {
    if (!k.correct) continue
    const idx = Math.min(bucketCount - 1, Math.floor(k.tMs / 1000))
    buckets[idx] += 1
  }

  const wpmPerBucket = buckets.map((count) => (count / 5) * 60)
  const mean = wpmPerBucket.reduce((a, b) => a + b, 0) / wpmPerBucket.length
  if (mean === 0) return 100

  const variance = wpmPerBucket.reduce((a, b) => a + (b - mean) ** 2, 0) / wpmPerBucket.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = stdDev / mean

  return Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100))
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
