import { classifyWordChars } from '../../lib/engine/correctness'
import type { CharStatus } from '../../lib/engine/types'

interface WordsRendererProps {
  words: string[]
  typed: string[]
  cursorWordIdx: number
  caretSpanRef: (el: HTMLSpanElement | null) => void
}

const TRANSITION = 'color 100ms ease, background-color 100ms ease'

function statusStyle(status: CharStatus | undefined): React.CSSProperties {
  switch (status) {
    case 'correct':
      return { color: 'var(--correct)', transition: TRANSITION }
    case 'incorrect':
      return { color: 'var(--incorrect)', backgroundColor: 'var(--incorrect-bg)', borderRadius: 2, transition: TRANSITION }
    case 'extra':
      return { color: 'var(--extra)', textDecoration: 'line-through', transition: TRANSITION }
    case 'missed':
      return { color: 'var(--incorrect)', opacity: 0.5, textDecoration: 'underline', transition: TRANSITION }
    default:
      return { color: 'var(--text-muted)', transition: TRANSITION }
  }
}

export function WordsRenderer({ words, typed, cursorWordIdx, caretSpanRef }: WordsRendererProps) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-3 font-mono text-2xl leading-relaxed select-none" style={{ color: 'var(--text-muted)' }}>
      {words.map((word, wordIdx) => {
        const isCurrent = wordIdx === cursorWordIdx
        const isPast = wordIdx < cursorWordIdx
        const wordTyped = typed[wordIdx] ?? ''
        const statuses = classifyWordChars(word, wordTyped, isPast)
        const caretIdx = wordTyped.length
        const displayLen = isCurrent ? Math.max(word.length, wordTyped.length + 1) : Math.max(word.length, wordTyped.length)

        return (
          <span key={wordIdx} className="inline-flex">
            {Array.from({ length: displayLen }).map((_, charIdx) => {
              const isCaretPos = isCurrent && charIdx === caretIdx
              const ch = charIdx < word.length ? word[charIdx] : wordTyped[charIdx]
              return (
                <span
                  key={charIdx}
                  ref={isCaretPos ? caretSpanRef : undefined}
                  style={statusStyle(statuses[charIdx])}
                >
                  {ch ?? '​'}
                </span>
              )
            })}
          </span>
        )
      })}
    </div>
  )
}
