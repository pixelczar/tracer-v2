import { motion } from 'framer-motion'

interface BlinkingCursorProps {
  className?: string
}

export function BlinkingCursor({ className = '' }: BlinkingCursorProps) {
  return (
    <motion.span
      className={`inline-block text-accent ${className}`}
      animate={{ opacity: [1, 0] }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'steps(1)',
      }}
    >
      _
    </motion.span>
  )
}

// Inline variant for use in text
export function TracerCursor({ className = '' }: BlinkingCursorProps) {
  return (
    <span className={`inline-flex items-baseline font-mono ${className}`}>
      <span className="text-accent">//</span>
      <BlinkingCursor />
    </span>
  )
}
