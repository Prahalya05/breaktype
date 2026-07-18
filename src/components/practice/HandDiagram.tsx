import { motion } from 'framer-motion'
import type { FingerId } from '../../lib/fingerMap/keyToFinger'

const LEFT_FINGERS: { id: FingerId; height: number; label: string }[] = [
  { id: 'L-pinky', height: 44, label: 'pinky' },
  { id: 'L-ring', height: 58, label: 'ring' },
  { id: 'L-middle', height: 66, label: 'middle' },
  { id: 'L-index', height: 56, label: 'index' },
]

const RIGHT_FINGERS: { id: FingerId; height: number; label: string }[] = [
  { id: 'R-index', height: 56, label: 'index' },
  { id: 'R-middle', height: 66, label: 'middle' },
  { id: 'R-ring', height: 58, label: 'ring' },
  { id: 'R-pinky', height: 44, label: 'pinky' },
]

interface HandDiagramProps {
  activeFinger?: FingerId
  feedback?: 'correct' | 'incorrect' | null
}

function Finger({ height, active, feedback }: { height: number; active: boolean; feedback?: 'correct' | 'incorrect' | null }) {
  const bg = active ? (feedback === 'incorrect' ? 'var(--incorrect)' : 'var(--finger-active)') : 'var(--finger-idle)'
  return (
    <motion.div
      animate={active ? { y: [0, -4, 0] } : { y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-6 rounded-t-full"
      style={{ height, backgroundColor: bg, boxShadow: active ? '0 0 10px var(--accent-glow)' : undefined }}
    />
  )
}

function Palm({ align }: { align: 'left' | 'right' }) {
  return (
    <div
      className={`w-28 h-14 rounded-b-3xl ${align === 'left' ? 'rounded-tr-3xl' : 'rounded-tl-3xl'}`}
      style={{ backgroundColor: 'var(--bg-elevated-2)', border: '1px solid var(--border)' }}
    />
  )
}

export function HandDiagram({ activeFinger, feedback }: HandDiagramProps) {
  return (
    <div className="flex items-end justify-center gap-10 select-none">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-end gap-1.5">
          {LEFT_FINGERS.map((f) => (
            <Finger key={f.id} height={f.height} active={activeFinger === f.id} feedback={activeFinger === f.id ? feedback : null} />
          ))}
        </div>
        <Palm align="left" />
        <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>left hand</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-end gap-1.5">
          {RIGHT_FINGERS.map((f) => (
            <Finger key={f.id} height={f.height} active={activeFinger === f.id} feedback={activeFinger === f.id ? feedback : null} />
          ))}
        </div>
        <Palm align="right" />
        <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>right hand</span>
      </div>
    </div>
  )
}
