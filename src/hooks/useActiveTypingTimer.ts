import { useEffect, useRef } from 'react'
import { useDB } from './useDB'

const ACTIVITY_TIMEOUT_MS = 2000
const TICK_MS = 1000
const FLUSH_INTERVAL_MS = 5000

/**
 * Tracks time actually spent typing (not idle, not tab-backgrounded), globally across
 * whichever page/mode is active. A keydown anywhere resets the activity clock; a 1s
 * ticker accumulates elapsed time only while recent activity + tab visibility hold,
 * and periodically flushes into the DB's daily active-time totals.
 */
export function useActiveTypingTimer(): void {
  const { addActiveMs } = useDB()
  const lastActivityRef = useRef(0)
  const accumulatedRef = useRef(0)
  const lastTickRef = useRef(performance.now())

  useEffect(() => {
    function onKeyDown() {
      lastActivityRef.current = performance.now()
    }

    function flush() {
      if (accumulatedRef.current > 0) {
        addActiveMs(accumulatedRef.current)
        accumulatedRef.current = 0
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState !== 'visible') flush()
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('beforeunload', flush)

    const tickId = window.setInterval(() => {
      const now = performance.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now
      const isActive = now - lastActivityRef.current < ACTIVITY_TIMEOUT_MS
      if (isActive && document.visibilityState === 'visible') {
        accumulatedRef.current += delta
      }
    }, TICK_MS)

    const flushId = window.setInterval(flush, FLUSH_INTERVAL_MS)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('beforeunload', flush)
      window.clearInterval(tickId)
      window.clearInterval(flushId)
      flush()
    }
  }, [addActiveMs])
}
