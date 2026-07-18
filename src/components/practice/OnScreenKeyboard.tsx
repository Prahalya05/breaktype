import { motion } from 'framer-motion'
import { resolveFinger } from '../../lib/fingerMap/keyToFinger'

const ROWS: string[][] = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
]

interface OnScreenKeyboardProps {
  expectedChar: string
}

function normalizeForLookup(char: string): string {
  return char.toLowerCase()
}

export function OnScreenKeyboard({ expectedChar }: OnScreenKeyboardProps) {
  const expectedKey = normalizeForLookup(expectedChar)
  const expectedFinger = resolveFinger(expectedChar)

  return (
    <div className="flex flex-col gap-1.5 items-center select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1.5">
          {row.map((key) => {
            const isTarget = key === expectedKey
            const sameFinger = !isTarget && expectedFinger !== undefined && resolveFinger(key) === expectedFinger
            return (
              <motion.div
                key={key}
                animate={isTarget ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-9 h-9 rounded-md border flex items-center justify-center font-mono text-sm uppercase"
                style={{
                  borderColor: isTarget ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: isTarget ? 'var(--accent)' : sameFinger ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  color: isTarget ? 'var(--bg)' : 'var(--text-subtle)',
                  boxShadow: isTarget ? '0 0 12px var(--accent-glow)' : undefined,
                }}
              >
                {key}
              </motion.div>
            )
          })}
        </div>
      ))}
      <motion.div
        animate={expectedKey === ' ' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 h-9 rounded-md border"
        style={{
          borderColor: expectedKey === ' ' ? 'var(--accent)' : 'var(--border)',
          backgroundColor: expectedKey === ' ' ? 'var(--accent)' : 'var(--bg-elevated)',
        }}
      />
    </div>
  )
}
