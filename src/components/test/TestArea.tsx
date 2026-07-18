import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { WordsRenderer } from './WordsRenderer'
import { Caret } from './Caret'
import type { UseTypingEngineResult } from '../../hooks/useTypingEngine'

interface TestAreaProps {
  engine: UseTypingEngineResult
}

export function TestArea({ engine }: TestAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const caretSpanElRef = useRef<HTMLSpanElement | null>(null)
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0, height: 32 })

  function caretSpanRef(el: HTMLSpanElement | null) {
    caretSpanElRef.current = el
  }

  useLayoutEffect(() => {
    const el = caretSpanElRef.current
    if (!el) return
    setCaretPos({ x: el.offsetLeft, y: el.offsetTop, height: el.offsetHeight })
    el.scrollIntoView({ block: 'nearest' })
  }, [engine.typed, engine.cursorWordIdx, engine.words])

  useEffect(() => {
    engine.focusInput()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl border p-6 max-h-64 overflow-y-auto cursor-text"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      onClick={engine.focusInput}
    >
      <input
        ref={engine.inputRef}
        onKeyDown={engine.handleKeyDown}
        value=""
        onChange={() => {}}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        autoComplete="off"
        aria-label="Typing input"
        className="absolute opacity-0 w-px h-px pointer-events-none"
      />
      <Caret x={caretPos.x} y={caretPos.y} height={caretPos.height} visible={engine.status !== 'finished'} />
      <WordsRenderer words={engine.words} typed={engine.typed} cursorWordIdx={engine.cursorWordIdx} caretSpanRef={caretSpanRef} />
    </div>
  )
}
