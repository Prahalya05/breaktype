import { useNavigate, useParams } from 'react-router-dom'
import { getLesson } from '../lib/fingerMap/curriculum'
import { LessonRunner } from '../components/practice/LessonRunner'

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const lesson = lessonId ? getLesson(lessonId) : undefined

  if (!lesson) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p style={{ color: 'var(--text-muted)' }}>Lesson not found.</p>
        <button type="button" onClick={() => navigate('/practice')} className="text-sm underline" style={{ color: 'var(--accent)' }}>
          back to lessons
        </button>
      </div>
    )
  }

  return <LessonRunner key={lesson.id} lesson={lesson} onExit={() => navigate('/practice')} />
}
