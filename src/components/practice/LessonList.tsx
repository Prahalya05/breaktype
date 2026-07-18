import { Link } from 'react-router-dom'
import { CURRICULUM, isLessonUnlocked, type LessonGroup } from '../../lib/fingerMap/curriculum'
import { useDB } from '../../hooks/useDB'
import { roundTo } from '../../lib/engine/metrics'

const GROUP_LABELS: Record<LessonGroup, string> = {
  home: 'Home row',
  top: 'Top row',
  bottom: 'Bottom row',
  numbers: 'Numbers',
  symbols: 'Symbols',
  words: 'Mixed practice',
}

export function LessonList() {
  const { db } = useDB()
  const sorted = [...CURRICULUM].sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((lesson) => {
        const unlocked = isLessonUnlocked(lesson, db.lessonProgress)
        const progress = db.lessonProgress[lesson.id]
        const completed = Boolean(progress?.completedAt)

        return (
          <Link
            key={lesson.id}
            to={`/practice/${lesson.id}`}
            className="flex items-center justify-between rounded-lg border p-4 transition-opacity"
            style={{
              borderColor: completed ? 'var(--accent)' : 'var(--border)',
              backgroundColor: 'var(--bg-elevated)',
              opacity: unlocked ? 1 : 0.55,
            }}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {GROUP_LABELS[lesson.group]}
                </span>
                {!unlocked && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    · locked, but you can practice anyway
                  </span>
                )}
                {completed && (
                  <span className="text-xs" style={{ color: 'var(--success)' }}>· completed</span>
                )}
              </div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{lesson.title}</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{lesson.description}</span>
            </div>

            {progress && (
              <div className="flex flex-col items-end text-sm shrink-0 pl-4" style={{ color: 'var(--text-subtle)' }}>
                <span>{roundTo(progress.bestWpm, 0)} wpm</span>
                <span>{roundTo(progress.bestAccuracy, 0)}% best</span>
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
