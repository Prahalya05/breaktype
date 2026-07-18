import { AnimatePresence, motion } from 'framer-motion'

export function QuoteTicker({ quote }: { quote: string }) {
  return (
    <div className="min-h-[1.75rem] flex items-center justify-center px-4 text-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={quote}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-sm italic"
          style={{ color: 'var(--text-subtle)' }}
        >
          "{quote}"
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
