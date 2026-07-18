import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { NavBar } from './components/layout/NavBar'
import { QuoteTicker } from './components/layout/QuoteTicker'
import { useQuotes } from './hooks/useQuotes'
import { DBProvider } from './hooks/useDB'
import { useActiveTypingTimer } from './hooks/useActiveTypingTimer'
import { TestPage } from './routes/TestPage'
import { PracticePage } from './routes/PracticePage'
import { LessonPage } from './routes/LessonPage'
import { BreakPage } from './routes/BreakPage'
import { SettingsPage } from './routes/SettingsPage'

// Chart-heavy pages (recharts) are code-split out of the initial bundle since the
// core typing test — the thing people open this app for during a short break — should
// load as fast as possible.
const CoachPage = lazy(() => import('./routes/CoachPage').then((m) => ({ default: m.CoachPage })))
const HistoryPage = lazy(() => import('./routes/HistoryPage').then((m) => ({ default: m.HistoryPage })))

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route path="/" element={<TestPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/:lessonId" element={<LessonPage />} />
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/break" element={<BreakPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function Shell() {
  const { quote } = useQuotes()
  useActiveTypingTimer()

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <QuoteTicker quote={quote} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <AnimatedRoutes />
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <DBProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </DBProvider>
    </ThemeProvider>
  )
}

export default App
