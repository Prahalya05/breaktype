import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTypingEngine } from '../hooks/useTypingEngine'
import { useDB } from '../hooks/useDB'
import { TestArea } from '../components/test/TestArea'
import { ConfigBar } from '../components/test/ConfigBar'
import { LiveStatsBar } from '../components/test/LiveStatsBar'
import { ResultsScreen } from '../components/test/ResultsScreen'
import { buildTestSessionRecord } from '../lib/storage/buildSession'
import { testModeKey } from '../lib/storage/aggregation'
import type { TestConfig } from '../lib/engine/types'
import type { BreakTypeDB } from '../lib/storage/schema'

function initialConfigFromSettings(db: BreakTypeDB): TestConfig {
  return {
    mode: db.settings.defaultWordMode,
    punctuation: db.settings.defaultPunctuation,
    numbers: db.settings.defaultNumbers,
  }
}

export function TestPage() {
  const { db, recordTestSession } = useDB()
  const dbRef = useRef(db)
  dbRef.current = db

  const [config, setConfig] = useState<TestConfig>(() => initialConfigFromSettings(db))
  const [isNewPB, setIsNewPB] = useState(false)

  const engine = useTypingEngine(config, (result, ctx) => {
    const session = buildTestSessionRecord(result, ctx.config, ctx.keystrokeLog)
    const modeKey = testModeKey(session)
    const prevBest = dbRef.current.personalBests.byMode[modeKey] ?? 0
    setIsNewPB(result.wpm > prevBest && ctx.keystrokeLog.length > 0)
    recordTestSession(session, ctx.words, ctx.typed)
  })

  function handleConfigChange(next: TestConfig) {
    setConfig(next)
    engine.restart(next)
  }

  function handleRestart() {
    setIsNewPB(false)
    engine.restart()
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {engine.status === 'finished' && engine.result ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultsScreen result={engine.result} onRestart={handleRestart} isNewPB={isNewPB} />
          </motion.div>
        ) : (
          <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <ConfigBar config={config} onChange={handleConfigChange} disabled={engine.status === 'running'} />
              <LiveStatsBar
                words={engine.words}
                typed={engine.typed}
                cursorWordIdx={engine.cursorWordIdx}
                elapsedSeconds={engine.elapsedSeconds}
                remainingSeconds={engine.remainingSeconds}
                mode={config.mode}
              />
            </div>
            <TestArea engine={engine} />
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              press <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border)' }}>tab</kbd> to restart
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
