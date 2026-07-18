import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { CoachTip } from '../../lib/coach/tipGenerator'

const KIND_LABEL: Record<CoachTip['kind'], string> = {
  'weak-finger': 'Finger accuracy',
  'strength-finger': 'Strength',
  'weak-key': 'Key accuracy',
  substitution: 'Common typo',
  'word-substitution': 'Common typo',
  fatigue: 'Fatigue',
  'slow-bigram': 'Slow combo',
}

export function TipCard({ tip }: { tip: CoachTip }) {
  const isStrength = tip.kind === 'strength-finger'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 rounded-lg border p-4"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
    >
      <span className="text-xs uppercase tracking-wide font-medium" style={{ color: isStrength ? 'var(--success)' : 'var(--accent)' }}>
        {KIND_LABEL[tip.kind]}
      </span>
      <p style={{ color: 'var(--text-primary)' }}>{tip.message}</p>
      {tip.linkTo && (
        <Link to={tip.linkTo} className="text-sm underline w-fit" style={{ color: 'var(--accent)' }}>
          practice this →
        </Link>
      )}
    </motion.div>
  )
}
