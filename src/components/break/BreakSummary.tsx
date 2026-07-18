import { motion } from 'framer-motion'
import { buildBreakSummary } from '../../lib/engine/breakSummary'
import { roundTo } from '../../lib/engine/metrics'
import { formatDuration } from '../../lib/utils/time'
import { StatTile } from '../shared/StatTile'
import type { TestSessionRecord } from '../../lib/storage/schema'

interface BreakSummaryProps {
  rounds: TestSessionRecord[]
  onDone: () => void
}

export function BreakSummary({ rounds, onDone }: BreakSummaryProps) {
  const summary = buildBreakSummary(rounds)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-8 py-12"
    >
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--accent)' }}>Break's over!</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nice work — here's how your break went.</p>
      </div>

      {summary.totalRounds === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No rounds completed — no worries, jump back in anytime.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="rounds" value={String(summary.totalRounds)} />
          <StatTile label="avg wpm" value={String(roundTo(summary.avgWpm, 0))} />
          <StatTile label="avg accuracy" value={`${roundTo(summary.avgAccuracy, 0)}%`} />
          <StatTile label="time typing" value={formatDuration(summary.totalSeconds * 1000)} />
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="px-5 py-2 rounded-lg font-medium"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
      >
        Back to work
      </button>
    </motion.div>
  )
}
