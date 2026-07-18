import { LessonList } from '../components/practice/LessonList'

export function PracticePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Finger training</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Learn touch typing the right way — one row, one finger at a time.
        </p>
      </div>
      <LessonList />
    </div>
  )
}
