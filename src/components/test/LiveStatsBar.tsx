import { computeCharCounts } from '../../lib/engine/correctness'
import { computeAccuracy, computeWpm, roundTo } from '../../lib/engine/metrics'
import type { TestMode } from '../../lib/engine/types'

interface LiveStatsBarProps {
  words: string[]
  typed: string[]
  cursorWordIdx: number
  elapsedSeconds: number
  remainingSeconds: number | null
  mode: TestMode
}

export function LiveStatsBar({ words, typed, cursorWordIdx, elapsedSeconds, remainingSeconds, mode }: LiveStatsBarProps) {
  const charCount = computeCharCounts(words, typed, cursorWordIdx)
  const wpm = computeWpm(charCount, elapsedSeconds)
  const accuracy = computeAccuracy(charCount)

  const timeLabel = mode.type === 'time' && remainingSeconds !== null ? Math.ceil(remainingSeconds) : Math.floor(elapsedSeconds)

  return (
    <div className="flex items-center gap-6 font-mono text-lg" style={{ color: 'var(--accent)' }}>
      <span title="Words per minute">{roundTo(wpm, 0)} wpm</span>
      <span title="Accuracy" style={{ color: 'var(--text-subtle)' }}>{roundTo(accuracy, 0)}%</span>
      <span title={mode.type === 'time' ? 'Time remaining' : 'Elapsed time'} style={{ color: 'var(--text-subtle)' }}>
        {timeLabel}s
      </span>
    </div>
  )
}
