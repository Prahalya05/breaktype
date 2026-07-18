import { CURRICULUM } from '../fingerMap/curriculum'
import { FINGER_LABELS, keysForFinger, type FingerId } from '../fingerMap/keyToFinger'
import type { CoachFinding, CoachFindingKind } from './analyzers/types'

export interface CoachTip {
  id: string
  kind: CoachFindingKind
  severity: number
  message: string
  linkTo?: string
}

function lessonForFinger(finger: FingerId): string | undefined {
  const keys = keysForFinger(finger)
  return CURRICULUM.find((l) => l.group !== 'words' && l.keys.some((k) => keys.includes(k)))?.id
}

const MAX_TIPS = 8

export function generateTips(findings: CoachFinding[]): CoachTip[] {
  const tips: CoachTip[] = []

  for (const f of findings) {
    switch (f.kind) {
      case 'weak-finger': {
        const finger = f.data.finger as FingerId
        const keys = keysForFinger(finger).join(' ').toUpperCase()
        const lessonId = lessonForFinger(finger)
        tips.push({
          id: `weak-finger-${finger}`,
          kind: f.kind,
          severity: f.severity,
          message: `Your ${FINGER_LABELS[finger].toLowerCase()} (${keys}) is about ${f.data.gapPct}% less accurate than your other fingers — a quick lesson could help.`,
          linkTo: lessonId ? `/practice/${lessonId}` : undefined,
        })
        break
      }
      case 'strength-finger': {
        const finger = f.data.finger as FingerId
        tips.push({
          id: `strength-finger-${finger}`,
          kind: f.kind,
          severity: f.severity,
          message: `Your ${FINGER_LABELS[finger].toLowerCase()} is about ${f.data.gapPct}% more accurate than your average — nice work, keep it up.`,
        })
        break
      }
      case 'weak-key':
        tips.push({
          id: `weak-key-${f.data.key}`,
          kind: f.kind,
          severity: f.severity,
          message: `The "${f.data.key}" key trips you up — ${Math.round((f.data.accuracy as number) * 100)}% accuracy over ${f.data.attempts} attempts. Slow down when it comes up.`,
        })
        break
      case 'substitution':
        tips.push({
          id: `sub-${f.data.expected}-${f.data.actual}`,
          kind: f.kind,
          severity: f.severity,
          message: `You often type "${f.data.actual}" instead of "${f.data.expected}" — ${f.data.count} times recently. Watch for that swap.`,
        })
        break
      case 'word-substitution':
        tips.push({
          id: `wordsub-${f.data.expected}-${f.data.actual}`,
          kind: f.kind,
          severity: f.severity,
          message: `You've typed "${f.data.actual}" instead of "${f.data.expected}" ${f.data.count} times recently — a common slip worth watching for.`,
        })
        break
      case 'fatigue':
        tips.push({
          id: 'fatigue',
          kind: f.kind,
          severity: f.severity,
          message: `Your accuracy drops by about ${f.data.avgDropPct}% in the second half of your sessions (seen in ${f.data.sessionsAffected} of your last ${f.data.sessionsChecked}) — try shorter sessions or a brief pause partway through.`,
        })
        break
      case 'slow-bigram':
        tips.push({
          id: `bigram-${f.data.bigram}`,
          kind: f.kind,
          severity: f.severity,
          message: `The letter combo "${f.data.bigram}" slows you down (${f.data.avgMs}ms vs your ${f.data.globalAvgMs}ms average) — a few drills with that combo could help.`,
        })
        break
    }
  }

  return tips.sort((a, b) => b.severity - a.severity).slice(0, MAX_TIPS)
}
