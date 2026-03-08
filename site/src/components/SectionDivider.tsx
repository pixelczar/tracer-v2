import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

export function SectionDivider() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-6 py-2">
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease }}
        style={{ transformOrigin: 'center' }}
      />
    </div>
  )
}
