import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BreakPicker } from '../components/break/BreakPicker'
import { BreakSessionRunner } from '../components/break/BreakSessionRunner'
import { BreakSummary } from '../components/break/BreakSummary'
import type { TestSessionRecord } from '../lib/storage/schema'

type BreakPhase = { stage: 'pick' } | { stage: 'running'; durationSec: number } | { stage: 'summary'; rounds: TestSessionRecord[] }

export function BreakPage() {
  const [phase, setPhase] = useState<BreakPhase>({ stage: 'pick' })

  return (
    <AnimatePresence mode="wait">
      {phase.stage === 'pick' && (
        <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BreakPicker onPick={(seconds) => setPhase({ stage: 'running', durationSec: seconds })} />
        </motion.div>
      )}
      {phase.stage === 'running' && (
        <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BreakSessionRunner
            durationSec={phase.durationSec}
            onComplete={(rounds) => setPhase({ stage: 'summary', rounds })}
          />
        </motion.div>
      )}
      {phase.stage === 'summary' && (
        <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BreakSummary rounds={phase.rounds} onDone={() => setPhase({ stage: 'pick' })} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
