import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TestSessionRecord } from '../../lib/storage/schema'

interface WpmChartProps {
  sessions: TestSessionRecord[]
}

export function WpmChart({ sessions }: WpmChartProps) {
  const data = sessions.map((s, i) => ({
    index: i + 1,
    wpm: Math.round(s.result.wpm),
    accuracy: Math.round(s.result.accuracy),
  }))

  if (data.length === 0) {
    return (
      <div className="text-sm py-16 text-center" style={{ color: 'var(--text-muted)' }}>
        No sessions yet — take a test to start your history.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="index" stroke="var(--text-muted)" fontSize={12} />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
          labelStyle={{ color: 'var(--text-subtle)' }}
        />
        <Line type="monotone" dataKey="wpm" stroke="var(--accent)" strokeWidth={2} dot={false} name="WPM" />
        <Line type="monotone" dataKey="accuracy" stroke="var(--success)" strokeWidth={2} dot={false} name="Accuracy %" />
      </LineChart>
    </ResponsiveContainer>
  )
}
