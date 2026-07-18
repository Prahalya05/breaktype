import { generateWords } from '../engine/wordGenerator'

export type LessonGroup = 'home' | 'top' | 'bottom' | 'numbers' | 'symbols' | 'words'

export interface Lesson {
  id: string
  title: string
  group: LessonGroup
  order: number
  description: string
  keys: string[]
  unlockRequires?: string
}

const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')
const ALL_DIGITS = '0123456789'.split('')

export const CURRICULUM: Lesson[] = [
  {
    id: 'home-row-1',
    title: 'Home Row Basics',
    group: 'home',
    order: 1,
    description: 'Rest your fingers on A S D F and J K L ; — the home row. Every finger returns here between keys.',
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
  },
  {
    id: 'home-row-2',
    title: 'Home Row: G & H',
    group: 'home',
    order: 2,
    description: 'Reach your index fingers inward to G and H without moving the rest of your hand.',
    keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    unlockRequires: 'home-row-1',
  },
  {
    id: 'top-row-1',
    title: 'Top Row Basics',
    group: 'top',
    order: 3,
    description: 'Reach up from the home row to Q W E R and U I O P.',
    keys: ['q', 'w', 'e', 'r', 'u', 'i', 'o', 'p'],
    unlockRequires: 'home-row-2',
  },
  {
    id: 'top-row-2',
    title: 'Top Row: T & Y',
    group: 'top',
    order: 4,
    description: 'Fill in T and Y — both reached by your index fingers.',
    keys: ['t', 'y'],
    unlockRequires: 'top-row-1',
  },
  {
    id: 'bottom-row-1',
    title: 'Bottom Row: Left Hand',
    group: 'bottom',
    order: 5,
    description: 'Drop down to Z X C V B on your left hand.',
    keys: ['z', 'x', 'c', 'v', 'b'],
    unlockRequires: 'top-row-2',
  },
  {
    id: 'bottom-row-2',
    title: 'Bottom Row: Right Hand',
    group: 'bottom',
    order: 6,
    description: 'Finish the bottom row with N M , . and /',
    keys: ['n', 'm', ',', '.', '/'],
    unlockRequires: 'bottom-row-1',
  },
  {
    id: 'words-1',
    title: 'Mixed Words: Letters',
    group: 'words',
    order: 7,
    description: 'Put it all together — real words using every letter key you\'ve learned.',
    keys: ALL_LETTERS,
    unlockRequires: 'bottom-row-2',
  },
  {
    id: 'numbers-1',
    title: 'Numbers: Left Hand',
    group: 'numbers',
    order: 8,
    description: 'Reach up to 1 2 3 4 5 on the number row.',
    keys: ['1', '2', '3', '4', '5'],
    unlockRequires: 'words-1',
  },
  {
    id: 'numbers-2',
    title: 'Numbers: Right Hand',
    group: 'numbers',
    order: 9,
    description: 'Finish the number row with 6 7 8 9 0.',
    keys: ['6', '7', '8', '9', '0'],
    unlockRequires: 'numbers-1',
  },
  {
    id: 'words-2',
    title: 'Mixed Words & Numbers',
    group: 'words',
    order: 10,
    description: 'Real words mixed with numbers, just like everyday typing.',
    keys: [...ALL_LETTERS, ...ALL_DIGITS],
    unlockRequires: 'numbers-2',
  },
  {
    id: 'symbols-1',
    title: 'Common Symbols',
    group: 'symbols',
    order: 11,
    description: "Punctuation marks: , . ; ' - and more.",
    keys: [',', '.', ';', "'", '-', '/'],
    unlockRequires: 'words-2',
  },
  {
    id: 'words-3',
    title: 'Full Practice',
    group: 'words',
    order: 12,
    description: 'Full sentences with punctuation — the real thing.',
    keys: [...ALL_LETTERS, ...ALL_DIGITS, ',', '.', ';', "'", '-', '/'],
    unlockRequires: 'symbols-1',
  },
]

export function getLesson(id: string): Lesson | undefined {
  return CURRICULUM.find((l) => l.id === id)
}

export function isLessonUnlocked(lesson: Lesson, progress: Record<string, { completedAt?: number }>): boolean {
  if (!lesson.unlockRequires) return true
  return Boolean(progress[lesson.unlockRequires]?.completedAt)
}

function randomDrillToken(keys: string[]): string {
  const length = 2 + Math.floor(Math.random() * 3) // 2-4 chars
  let token = ''
  let prev = ''
  for (let i = 0; i < length; i++) {
    let ch = keys[Math.floor(Math.random() * keys.length)]
    if (ch === prev && keys.length > 1) {
      ch = keys[(keys.indexOf(ch) + 1) % keys.length]
    }
    token += ch
    prev = ch
  }
  return token
}

/**
 * Generates the drill word/token list for a lesson. "words" group lessons reuse the
 * real word generator (with punctuation/numbers enabled based on the lesson's key set)
 * so mixed-practice lessons feel like real typing; row/number/symbol lessons generate
 * short pseudo-random letter clusters limited to that lesson's focus keys.
 */
export function generateLessonWords(lesson: Lesson, count: number): string[] {
  if (lesson.group === 'words') {
    const hasPunctuation = lesson.keys.some((k) => /[,.;'\-/]/.test(k))
    const hasNumbers = lesson.keys.some((k) => /[0-9]/.test(k))
    return generateWords(count, { punctuation: hasPunctuation, numbers: hasNumbers })
  }
  return Array.from({ length: count }, () => randomDrillToken(lesson.keys))
}
