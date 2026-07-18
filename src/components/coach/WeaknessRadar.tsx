import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { FINGER_LABELS, type FingerId } from '../../lib/fingerMap/keyToFinger'
import type { BreakTypeDB } from '../../lib/storage/schema'

const FINGER_ORDER: FingerId[] = ['L-pinky', 'L-ring', 'L-middle', 'L-index', 'R-index', 'R-middle', 'R-ring', 'R-pinky']

function shortLabel(finger: FingerId): string {
  return FINGER_LABELS[finger].replace('Left ', 'L ').replace('Right ', 'R ').replace(' finger', '')
}

interface WeaknessRadarProps {
  perFinger: BreakTypeDB['aggregates']['perFinger']
}

export function WeaknessRadar({ perFinger }: WeaknessRadarProps) {
  const data = FINGER_ORDER.map((finger) => {
    const agg = perFinger[finger]
    const accuracy = agg && agg.attempts > 0 ? Math.round((agg.correct / agg.attempts) * 100) : 0
    return { finger: shortLabel(finger), accuracy }
  })

  const hasData = data.some((d) => d.accuracy > 0)
  if (!hasData) {
    return (
      <div className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
        Not enough data yet — take a few more tests or lessons to see your finger accuracy.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="finger" stroke="var(--text-muted)" fontSize={11} />
        <Radar dataKey="accuracy" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
