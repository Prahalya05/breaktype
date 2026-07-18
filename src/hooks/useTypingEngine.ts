import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent } from 'react'
import { generateWords } from '../lib/engine/wordGenerator'
import { computeCharCounts } from '../lib/engine/correctness'
import { computeAccuracy, computeConsistency, computeRawWpm, computeWpm } from '../lib/engine/metrics'
import { resolveFinger } from '../lib/fingerMap/keyToFinger'
import type { EngineStatus, KeystrokeEvent, TestConfig, TestResult } from '../lib/engine/types'

const TIME_MODE_INITIAL_WORDS = 60
const TIME_MODE_REFILL_THRESHOLD = 15
const TIME_MODE_REFILL_COUNT = 40

interface EngineState {
  status: EngineStatus
  config: TestConfig
  words: string[]
  typed: string[]
  cursorWordIdx: number
  startedAt: number | null
  endedAt: number | null
  keystrokeLog: KeystrokeEvent[]
  result: TestResult | null
}

type Action =
  | { type: 'RESTART'; config: TestConfig; words: string[] }
  | { type: 'TYPE_CHAR'; char: string; now: number }
  | { type: 'BACKSPACE' }
  | { type: 'ADVANCE_WORD'; now: number }
  | { type: 'APPEND_WORDS'; words: string[] }
  | { type: 'FINISH'; now: number }

export type WordsGenerator = (count: number, prevLastWord?: string) => string[]

function initialWordsFor(config: TestConfig, wordsGenerator?: WordsGenerator): string[] {
  const count = config.mode.type === 'words' ? config.mode.count : TIME_MODE_INITIAL_WORDS
  if (wordsGenerator) return wordsGenerator(count)
  return generateWords(count, { punctuation: config.punctuation, numbers: config.numbers })
}

function createInitialState(config: TestConfig, wordsGenerator?: WordsGenerator): EngineState {
  return {
    status: 'idle',
    config,
    words: initialWordsFor(config, wordsGenerator),
    typed: [],
    cursorWordIdx: 0,
    startedAt: null,
    endedAt: null,
    keystrokeLog: [],
    result: null,
  }
}

function finishResult(state: EngineState, now: number): TestResult {
  const elapsedSeconds = state.startedAt ? Math.max(0.001, (now - state.startedAt) / 1000) : 0
  const charCount = computeCharCounts(state.words, state.typed, state.cursorWordIdx)
  const rawWpm = computeRawWpm(charCount, elapsedSeconds)
  const wpm = computeWpm(charCount, elapsedSeconds)
  const accuracy = computeAccuracy(charCount)
  const consistency = computeConsistency(state.keystrokeLog, elapsedSeconds)
  return {
    wpm,
    rawWpm,
    accuracy,
    consistency,
    errorCount: charCount.incorrect + charCount.extra,
    charCount,
    elapsedSeconds,
  }
}

function reducer(state: EngineState, action: Action): EngineState {
  switch (action.type) {
    case 'RESTART':
      return createInitialStateFromWords(action.config, action.words)

    case 'TYPE_CHAR': {
      if (state.status === 'finished') return state
      const isFirstKeystroke = state.status === 'idle'
      const startedAt = isFirstKeystroke ? action.now : state.startedAt

      const typed = [...state.typed]
      const currentTyped = typed[state.cursorWordIdx] ?? ''
      const currentWord = state.words[state.cursorWordIdx] ?? ''
      const expected: string | undefined = currentWord[currentTyped.length]
      const correct = expected !== undefined && expected === action.char

      typed[state.cursorWordIdx] = currentTyped + action.char

      const keystroke: KeystrokeEvent = {
        char: expected ?? action.char,
        typed: action.char,
        correct,
        tMs: startedAt ? action.now - startedAt : 0,
        finger: resolveFinger(action.char),
      }

      let next: EngineState = {
        ...state,
        status: 'running',
        startedAt,
        typed,
        keystrokeLog: [...state.keystrokeLog, keystroke],
      }

      const isLastWord = state.cursorWordIdx === state.words.length - 1
      const isWordsMode = state.config.mode.type === 'words'
      const wordLimit = state.config.mode.type === 'words' ? state.config.mode.count : Infinity
      const reachedWordLimit = state.cursorWordIdx >= wordLimit - 1
      if (isWordsMode && isLastWord && reachedWordLimit && typed[state.cursorWordIdx].length >= currentWord.length) {
        next = { ...next, status: 'finished', endedAt: action.now, result: finishResult(next, action.now) }
      }

      return next
    }

    case 'BACKSPACE': {
      if (state.status !== 'running') return state
      const currentTyped = state.typed[state.cursorWordIdx] ?? ''
      if (currentTyped.length === 0) return state
      const typed = [...state.typed]
      typed[state.cursorWordIdx] = currentTyped.slice(0, -1)
      return { ...state, typed }
    }

    case 'ADVANCE_WORD': {
      if (state.status !== 'running') return state
      const currentTyped = state.typed[state.cursorWordIdx] ?? ''
      if (currentTyped.length === 0) return state

      const nextCursor = state.cursorWordIdx + 1
      const wordLimit = state.config.mode.type === 'words' ? state.config.mode.count : Infinity

      if (nextCursor >= wordLimit) {
        const advanced = { ...state, cursorWordIdx: Math.min(nextCursor, state.words.length - 1) }
        return { ...advanced, status: 'finished', endedAt: action.now, result: finishResult(advanced, action.now) }
      }

      return { ...state, cursorWordIdx: nextCursor }
    }

    case 'APPEND_WORDS':
      return { ...state, words: [...state.words, ...action.words] }

    case 'FINISH': {
      if (state.status === 'finished') return state
      return { ...state, status: 'finished', endedAt: action.now, result: finishResult(state, action.now) }
    }

    default:
      return state
  }
}

function createInitialStateFromWords(config: TestConfig, words: string[]): EngineState {
  return {
    status: 'idle',
    config,
    words,
    typed: [],
    cursorWordIdx: 0,
    startedAt: null,
    endedAt: null,
    keystrokeLog: [],
    result: null,
  }
}

export interface UseTypingEngineResult {
  status: EngineStatus
  words: string[]
  typed: string[]
  cursorWordIdx: number
  elapsedSeconds: number
  remainingSeconds: number | null
  result: TestResult | null
  keystrokeLog: KeystrokeEvent[]
  inputRef: React.RefObject<HTMLInputElement | null>
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  restart: (config?: TestConfig) => void
  forceFinish: () => void
  focusInput: () => void
}

export function useTypingEngine(
  initialConfig: TestConfig,
  onFinish?: (result: TestResult, ctx: { words: string[]; typed: string[]; keystrokeLog: KeystrokeEvent[]; config: TestConfig }) => void,
  wordsGenerator?: WordsGenerator,
): UseTypingEngineResult {
  const [state, dispatch] = useReducer(reducer, initialConfig, (cfg) => createInitialState(cfg, wordsGenerator))
  const inputRef = useRef<HTMLInputElement>(null)
  const [tick, setTick] = useState(0)
  const finishedNotified = useRef(false)

  const restart = useCallback((config?: TestConfig) => {
    const nextConfig = config ?? state.config
    dispatch({ type: 'RESTART', config: nextConfig, words: initialWordsFor(nextConfig, wordsGenerator) })
    finishedNotified.current = false
    setTick((t) => t + 1)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [state.config, wordsGenerator])

  const forceFinish = useCallback(() => {
    dispatch({ type: 'FINISH', now: performance.now() })
  }, [])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // Global Tab-to-restart: bound to the window, not just the hidden input, because
  // the input unmounts once the results screen replaces the test view, and at that
  // point Tab would otherwise just move browser focus instead of restarting.
  useEffect(() => {
    function onGlobalKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Tab') {
        e.preventDefault()
        restart()
      }
    }
    window.addEventListener('keydown', onGlobalKeyDown)
    return () => window.removeEventListener('keydown', onGlobalKeyDown)
  }, [restart])

  // Live ticking clock while the test is running (separate from reducer state so
  // the word grid doesn't re-render every 250ms, only the stats bar does).
  useEffect(() => {
    if (state.status !== 'running') return
    const id = setInterval(() => setTick((t) => t + 1), 250)
    return () => clearInterval(id)
  }, [state.status])

  const elapsedSeconds = state.startedAt ? (performance.now() - state.startedAt) / 1000 : 0
  const remainingSeconds = state.config.mode.type === 'time' ? Math.max(0, state.config.mode.seconds - elapsedSeconds) : null

  // Time-mode auto-finish when the countdown hits zero.
  useEffect(() => {
    if (state.status === 'running' && remainingSeconds !== null && remainingSeconds <= 0) {
      dispatch({ type: 'FINISH', now: performance.now() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, state.status])

  // Keep the time-mode word buffer topped up so typists never run out.
  useEffect(() => {
    if (state.config.mode.type !== 'time') return
    const remainingWords = state.words.length - state.cursorWordIdx
    if (remainingWords < TIME_MODE_REFILL_THRESHOLD) {
      const more = wordsGenerator
        ? wordsGenerator(TIME_MODE_REFILL_COUNT, state.words[state.words.length - 1])
        : generateWords(TIME_MODE_REFILL_COUNT, { punctuation: state.config.punctuation, numbers: state.config.numbers }, state.words[state.words.length - 1])
      dispatch({ type: 'APPEND_WORDS', words: more })
    }
  }, [state.cursorWordIdx, state.words, state.config, wordsGenerator])

  useEffect(() => {
    if (state.status === 'finished' && state.result && !finishedNotified.current) {
      finishedNotified.current = true
      onFinish?.(state.result, { words: state.words, typed: state.typed, keystrokeLog: state.keystrokeLog, config: state.config })
    }
  }, [state.status, state.result, state.words, state.typed, state.keystrokeLog, state.config, onFinish])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // Tab is handled globally (see the window-level listener above) since the
    // input this handler is bound to may not exist once results are shown.
    if (e.key === 'Tab') return
    if (state.status === 'finished') return

    if (e.key === 'Backspace') {
      e.preventDefault()
      dispatch({ type: 'BACKSPACE' })
      return
    }
    if (e.key === ' ') {
      e.preventDefault()
      dispatch({ type: 'ADVANCE_WORD', now: performance.now() })
      return
    }
    // Only single printable characters are treated as typing input; ignore modifiers,
    // arrows, Enter, etc.
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      dispatch({ type: 'TYPE_CHAR', char: e.key, now: performance.now() })
    }
  }, [state.status])

  return useMemo(() => ({
    status: state.status,
    words: state.words,
    typed: state.typed,
    cursorWordIdx: state.cursorWordIdx,
    elapsedSeconds,
    remainingSeconds,
    result: state.result,
    keystrokeLog: state.keystrokeLog,
    inputRef,
    handleKeyDown,
    restart,
    forceFinish,
    focusInput,
    // tick is intentionally included to force recompute of elapsedSeconds/remainingSeconds each interval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, elapsedSeconds, remainingSeconds, handleKeyDown, restart, forceFinish, focusInput, tick])
}
