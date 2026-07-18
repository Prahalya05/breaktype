import { useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTypingEngine } from '../../hooks/useTypingEngine'
import { useDB } from '../../hooks/useDB'
import { TestArea } from '../test/TestArea'
import { LiveStatsBar } from '../test/LiveStatsBar'
import { ResultsScreen } from '../test/ResultsScreen'
import { OnScreenKeyboard } from './OnScreenKeyboard'
import { HandDiagram } from './HandDiagram'
import { resolveFinger } from '../../lib/fingerMap/keyToFinger'
import { generateLessonWords, type Lesson } from '../../lib/fingerMap/curriculum'
import type { TestConfig } from '../../lib/engine/types'

const DRILL_LENGTH = 24

interface LessonRunnerProps {
  lesson: Lesson
  onExit: () => void
}

const LESSON_CONFIG: TestConfig = { mode: { type: 'words', count: DRILL_LENGTH }, punctuation: false, numbers: false }

export function LessonRunner({ lesson, onExit }: LessonRunnerProps) {
  const { recordLessonSession } = useDB()

  const wordsGenerator = useCallback((count: number) => generateLessonWords(lesson, count), [lesson])

  const engine = useTypingEngine(
    LESSON_CONFIG,
    (result, ctx) => {
      recordLessonSession({
        id: crypto.randomUUID(),
        lessonId: lesson.id,
        startedAt: Date.now() - result.elapsedSeconds * 1000,
        endedAt: Date.now(),
        keystrokes: ctx.keystrokeLog,
        result: { accuracy: result.accuracy, wpm: result.wpm, errorCount: result.errorCount },
      })
    },
    wordsGenerator,
  )

  const currentWord = engine.words[engine.cursorWordIdx] ?? ''
  const currentTyped = engine.typed[engine.cursorWordIdx] ?? ''
  const expectedChar = currentTyped.length < currentWord.length ? currentWord[currentTyped.length] : ' '
  const expectedFinger = resolveFinger(expectedChar)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onExit} className="text-sm" style={{ color: 'var(--text-subtle)' }}>
          ← back to lessons
        </button>
        <LiveStatsBar
          words={engine.words}
          typed={engine.typed}
          cursorWordIdx={engine.cursorWordIdx}
          elapsedSeconds={engine.elapsedSeconds}
          remainingSeconds={null}
          mode={LESSON_CONFIG.mode}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{lesson.title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{lesson.description}</p>
      </div>

      <AnimatePresence mode="wait">
        {engine.status === 'finished' && engine.result ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultsScreen result={engine.result} onRestart={() => engine.restart()} />
          </motion.div>
        ) : (
          <motion.div key="lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
            <TestArea engine={engine} />
            <div className="flex flex-col items-center gap-6 py-2">
              <OnScreenKeyboard expectedChar={expectedChar} />
              <HandDiagram activeFinger={expectedFinger} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
