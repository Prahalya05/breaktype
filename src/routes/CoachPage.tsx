import { useMemo } from 'react'
import { useDB } from '../hooks/useDB'
import { runCoachAnalysis } from '../lib/coach/runCoachAnalysis'
import { WeaknessRadar } from '../components/coach/WeaknessRadar'
import { TipCard } from '../components/coach/TipCard'

export function CoachPage() {
  const { db } = useDB()
  const report = useMemo(() => runCoachAnalysis(db), [db])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Your AI coach</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Personalized tips based on your typing history — analyzed instantly, right in your browser.
        </p>
      </div>

      {!report.hasEnoughData ? (
        <div className="text-sm text-center py-16" style={{ color: 'var(--text-muted)' }}>
          Not enough data yet — complete a few more tests or lessons, then check back here.
        </div>
      ) : (
        <>
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
            <h2 className="text-sm font-medium mb-2" style={{ color: 'var(--text-subtle)' }}>Accuracy by finger</h2>
            <WeaknessRadar perFinger={db.aggregates.perFinger} />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-subtle)' }}>Tips for you</h2>
            {report.tips.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No specific issues found yet — solid, consistent typing. Keep it up!</p>
            ) : (
              report.tips.map((tip) => <TipCard key={tip.id} tip={tip} />)
            )}
          </div>
        </>
      )}
    </div>
  )
}
