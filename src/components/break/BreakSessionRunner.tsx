import { useCallback, useEffect, useRef, useState } from 'react'
import { useTypingEngine, type UseTypingEngineResult } from '../../hooks/useTypingEngine'
import { useDB } from '../../hooks/useDB'
import { buildTestSessionRecord } from '../../lib/storage/buildSession'
import { TestArea } from '../test/TestArea'
import { LiveStatsBar } from '../test/LiveStatsBar'
import type { TestConfig, TestResult, KeystrokeEvent } from '../../lib/engine/types'
import type { TestSessionRecord } from '../../lib/storage/schema'

const ROUND_CONFIG: TestConfig = { mode: { type: 'time', seconds: 30 }, punctuation: false, numbers: false }

interface BreakSessionRunnerProps {
  durationSec: number
  onComplete: (rounds: TestSessionRecord[]) => void
}

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}

export function BreakSessionRunner({ durationSec, onComplete }: BreakSessionRunnerProps) {
  const { recordTestSession } = useDB()
  const breakStartRef = useRef(performance.now())
  const roundsRef = useRef<TestSessionRecord[]>([])
  const breakOverRef = useRef(false)
  const engineRef = useRef<UseTypingEngineResult | null>(null)
  const [remainingBreakSec, setRemainingBreakSec] = useState(durationSec)

  const handleRoundFinish = useCallback(
    (result: TestResult, ctx: { words: string[]; typed: string[]; keystrokeLog: KeystrokeEvent[]; config: TestConfig }) => {
      if (ctx.keystrokeLog.length > 0) {
        const session = buildTestSessionRecord(result, ctx.config, ctx.keystrokeLog, 'break')
        recordTestSession(session, ctx.words, ctx.typed)
        roundsRef.current = [...roundsRef.current, session]
      }

      if (breakOverRef.current) {
        onComplete(roundsRef.current)
      } else {
        engineRef.current?.restart()
      }
    },
    [recordTestSession, onComplete],
  )

  const engine = useTypingEngine(ROUND_CONFIG, handleRoundFinish)
  engineRef.current = engine

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = (performance.now() - breakStartRef.current) / 1000
      const remaining = Math.max(0, durationSec - elapsed)
      setRemainingBreakSec(remaining)
      if (remaining <= 0 && !breakOverRef.current) {
        breakOverRef.current = true
        engineRef.current?.forceFinish()
      }
    }, 500)
    return () => clearInterval(id)
  }, [durationSec])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>break time left</span>
          <span className="font-mono text-3xl font-bold" style={{ color: 'var(--accent)' }}>{formatClock(remainingBreakSec)}</span>
        </div>
        <LiveStatsBar
          words={engine.words}
          typed={engine.typed}
          cursorWordIdx={engine.cursorWordIdx}
          elapsedSeconds={engine.elapsedSeconds}
          remainingSeconds={engine.remainingSeconds}
          mode={ROUND_CONFIG.mode}
        />
      </div>
      <TestArea engine={engine} />
      <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        rounds keep coming until your break is up — just keep typing
      </p>
    </div>
  )
}
