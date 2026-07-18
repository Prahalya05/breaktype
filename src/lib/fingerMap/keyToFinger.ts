export type FingerId =
  | 'L-pinky'
  | 'L-ring'
  | 'L-middle'
  | 'L-index'
  | 'L-thumb'
  | 'R-thumb'
  | 'R-index'
  | 'R-middle'
  | 'R-ring'
  | 'R-pinky'

export const FINGER_LABELS: Record<FingerId, string> = {
  'L-pinky': 'Left pinky',
  'L-ring': 'Left ring finger',
  'L-middle': 'Left middle finger',
  'L-index': 'Left index finger',
  'L-thumb': 'Left thumb',
  'R-thumb': 'Right thumb',
  'R-index': 'Right index finger',
  'R-middle': 'Right middle finger',
  'R-ring': 'Right ring finger',
  'R-pinky': 'Right pinky',
}

// Standard touch-typing key-to-finger map (QWERTY).
const KEY_TO_FINGER: Record<string, FingerId> = {
  '`': 'L-pinky', '1': 'L-pinky', 'q': 'L-pinky', 'a': 'L-pinky', 'z': 'L-pinky',
  '2': 'L-ring', 'w': 'L-ring', 's': 'L-ring', 'x': 'L-ring',
  '3': 'L-middle', 'e': 'L-middle', 'd': 'L-middle', 'c': 'L-middle',
  '4': 'L-index', 'r': 'L-index', 'f': 'L-index', 'v': 'L-index',
  '5': 'L-index', 't': 'L-index', 'g': 'L-index', 'b': 'L-index',
  ' ': 'L-thumb',
  '6': 'R-index', 'y': 'R-index', 'h': 'R-index', 'n': 'R-index',
  '7': 'R-index', 'u': 'R-index', 'j': 'R-index', 'm': 'R-index',
  '8': 'R-middle', 'i': 'R-middle', 'k': 'R-middle', ',': 'R-middle',
  '9': 'R-ring', 'o': 'R-ring', 'l': 'R-ring', '.': 'R-ring',
  '0': 'R-pinky', 'p': 'R-pinky', ';': 'R-pinky', '/': 'R-pinky', '-': 'R-pinky', '=': 'R-pinky',
  "'": 'R-pinky', '[': 'R-pinky', ']': 'R-pinky', '\\': 'R-pinky',
}

// Shifted symbols resolve to the same finger as their unshifted base key.
const SHIFT_TO_BASE: Record<string, string> = {
  '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
}

export function resolveFinger(char: string): FingerId | undefined {
  const lower = char.toLowerCase()
  if (KEY_TO_FINGER[lower]) return KEY_TO_FINGER[lower]
  const base = SHIFT_TO_BASE[char]
  return base ? KEY_TO_FINGER[base] : undefined
}

export function keysForFinger(finger: FingerId): string[] {
  return Object.entries(KEY_TO_FINGER)
    .filter(([, f]) => f === finger)
    .map(([key]) => key)
    .filter((key) => key !== ' ')
}
