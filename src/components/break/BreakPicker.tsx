import { motion } from 'framer-motion'

const OPTIONS = [
  { seconds: 5 * 60, label: '5 min', hint: 'a quick breather' },
  { seconds: 15 * 60, label: '15 min', hint: 'a proper break' },
]

interface BreakPickerProps {
  onPick: (seconds: number) => void
}

export function BreakPicker({ onPick }: BreakPickerProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Taking a break?</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Pick a length and we'll run typing rounds until time's up — no need to watch the clock.
        </p>
      </div>

      <div className="flex gap-4">
        {OPTIONS.map((opt) => (
          <motion.button
            key={opt.seconds}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(opt.seconds)}
            className="flex flex-col items-center gap-1 rounded-xl border px-10 py-8"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
          >
            <span className="font-mono text-4xl font-bold" style={{ color: 'var(--accent)' }}>{opt.label}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{opt.hint}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
