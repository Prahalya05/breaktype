import { useDB } from '../hooks/useDB'
import { WpmChart } from '../components/test/WpmChart'
import { StatTile } from '../components/shared/StatTile'
import { dateKeyDaysAgo, formatDuration, todayDateKey } from '../lib/utils/time'
import { roundTo } from '../lib/engine/metrics'

function sumActiveMs(daily: { dateKey: string; activeMs: number }[], sinceDateKey?: string): number {
  return daily.filter((d) => !sinceDateKey || d.dateKey >= sinceDateKey).reduce((sum, d) => sum + d.activeMs, 0)
}

export function HistoryPage() {
  const { db } = useDB()
  const sessions = db.recentTestSessions

  const bestWpm = Object.values(db.personalBests.byMode).reduce((max, v) => Math.max(max, v), 0)
  const last10 = sessions.slice(-10)
  const avgWpm10 = last10.length ? last10.reduce((sum, s) => sum + s.result.wpm, 0) / last10.length : 0

  const todayMs = sumActiveMs(db.dailyActiveTime, todayDateKey())
  const weekMs = sumActiveMs(db.dailyActiveTime, dateKeyDaysAgo(6))
  const allTimeMs = sumActiveMs(db.dailyActiveTime)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Your history</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Recent test sessions and time actually spent typing.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatTile label="sessions (recent)" value={String(sessions.length)} />
        <StatTile label="personal best" value={sessions.length ? `${roundTo(bestWpm, 0)} wpm` : '—'} />
        <StatTile label="avg wpm (last 10)" value={last10.length ? `${roundTo(avgWpm10, 0)}` : '—'} />
        <StatTile label="typing today" value={formatDuration(todayMs)} />
        <StatTile label="typing this week" value={formatDuration(weekMs)} />
        <StatTile label="typing all-time" value={formatDuration(allTimeMs)} />
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
        <WpmChart sessions={sessions} />
      </div>
    </div>
  )
}
