import { motion } from 'framer-motion'

interface CaretProps {
  x: number
  y: number
  height: number
  visible: boolean
}

export function Caret({ x, y, height, visible }: CaretProps) {
  if (!visible) return null
  return (
    <motion.div
      className="absolute w-[2px] rounded-full animate-caret-blink pointer-events-none"
      style={{ backgroundColor: 'var(--accent)', height, top: 0, left: 0 }}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
    />
  )
}
