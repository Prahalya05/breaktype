import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'
import { roundTo } from '../../lib/engine/metrics'
import { triggerPBConfetti } from '../../lib/utils/confetti'
import type { TestResult } from '../../lib/engine/types'

interface ResultsScreenProps {
  result: TestResult
  onRestart: () => void
  isNewPB?: boolean
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <motion.div variants={item} className="flex flex-col items-center gap-1">
      <span className="text-sm" style={{ color: 'var(--text-subtle)' }}>{label}</span>
      <span className="font-mono text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </motion.div>
  )
}

export function ResultsScreen({ result, onRestart, isNewPB }: ResultsScreenProps) {
  const animatedWpm = useCountUp(result.wpm, 800)
  const hasCelebrated = useRef(false)

  useEffect(() => {
    if (isNewPB && !hasCelebrated.current) {
      hasCelebrated.current = true
      triggerPBConfetti()
    }
  }, [isNewPB])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center gap-8 py-8">
      {isNewPB && (
        <motion.div
          variants={item}
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent-strong)' }}
        >
          New personal best!
        </motion.div>
      )}
      <motion.div variants={item} className="flex flex-col items-center gap-1">
        <span className="text-sm tracking-wide" style={{ color: 'var(--text-subtle)' }}>WPM</span>
        <span className="font-mono text-7xl font-bold" style={{ color: 'var(--accent)' }}>
          {Math.round(animatedWpm)}
        </span>
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap justify-center gap-8">
        <StatBlock label="raw wpm" value={String(roundTo(result.rawWpm, 0))} />
        <StatBlock label="accuracy" value={`${roundTo(result.accuracy, 0)}%`} />
        <StatBlock label="consistency" value={`${roundTo(result.consistency, 0)}%`} />
        <StatBlock label="errors" value={String(result.errorCount)} />
        <StatBlock label="time" value={`${roundTo(result.elapsedSeconds, 1)}s`} />
      </motion.div>

      <motion.button
        variants={item}
        type="button"
        onClick={onRestart}
        className="px-5 py-2 rounded-lg font-medium"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
      >
        Next test <span style={{ opacity: 0.7 }}>(tab)</span>
      </motion.button>
    </motion.div>
  )
}
