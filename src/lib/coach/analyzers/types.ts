export type CoachFindingKind =
  | 'weak-finger'
  | 'strength-finger'
  | 'weak-key'
  | 'substitution'
  | 'word-substitution'
  | 'fatigue'
  | 'slow-bigram'

export interface CoachFinding {
  kind: CoachFindingKind
  severity: number
  data: Record<string, unknown>
}
