import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { loadDB, saveDB } from '../lib/storage/db'
import { createFreshDB, type BreakTypeDB, type BreakTypeSettings, type LessonSessionRecord, type TestSessionRecord } from '../lib/storage/schema'
import { addActiveMs as addActiveMsPure, recordLessonSession as recordLessonSessionPure, recordTestSession as recordTestSessionPure } from '../lib/storage/aggregation'

interface DBContextValue {
  db: BreakTypeDB
  recordTestSession: (session: TestSessionRecord, words: string[], typed: string[]) => void
  recordLessonSession: (session: LessonSessionRecord) => void
  addActiveMs: (ms: number) => void
  updateSettings: (partial: Partial<BreakTypeSettings>) => void
  resetAll: () => void
}

const DBContext = createContext<DBContextValue | null>(null)
const SAVE_DEBOUNCE_MS = 300

export function DBProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<BreakTypeDB>(loadDB)
  const saveTimeout = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    saveTimeout.current = window.setTimeout(() => saveDB(db), SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current)
    }
  }, [db])

  const value: DBContextValue = {
    db,
    recordTestSession: (session, words, typed) => setDb((prev) => recordTestSessionPure(prev, session, words, typed)),
    recordLessonSession: (session) => setDb((prev) => recordLessonSessionPure(prev, session)),
    addActiveMs: (ms) => setDb((prev) => addActiveMsPure(prev, ms)),
    updateSettings: (partial) => setDb((prev) => ({ ...prev, settings: { ...prev.settings, ...partial } })),
    resetAll: () => setDb(createFreshDB()),
  }

  return <DBContext.Provider value={value}>{children}</DBContext.Provider>
}

export function useDB(): DBContextValue {
  const ctx = useContext(DBContext)
  if (!ctx) throw new Error('useDB must be used within DBProvider')
  return ctx
}
