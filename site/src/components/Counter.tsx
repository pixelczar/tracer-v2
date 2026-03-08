import { motion, useInView, animate, useMotionValue } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

export function Counter() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const countValue = useMotionValue(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (inView) {
      const controls = animate(countValue, 6800, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setCount(Math.floor(v)),
      })
      return controls.stop
    }
  }, [inView, countValue])

  return (
    <section ref={ref} className="px-6 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6, ease }}
            className="text-[11px] tracking-[0.3em] uppercase text-muted/40 font-mono hidden md:block"
          >
            Technologies
          </motion.p>

          <motion.p
            initial={{ opacity: 0.06 }}
            animate={inView ? { opacity: 0.7 } : {}}
            transition={{ duration: 2, ease }}
            className="text-[14vw] md:text-[8vw] leading-none tracking-tight select-none tabular-nums"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {count.toLocaleString()}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6, ease }}
            className="text-[11px] tracking-[0.3em] uppercase text-muted/40 font-mono hidden md:block"
          >
            Detected
          </motion.p>
        </div>

        <motion.div
          className="h-px bg-accent/20 mx-auto mt-6"
          initial={{ width: 0 }}
          animate={inView ? { width: '60%' } : {}}
          transition={{ duration: 1.5, ease }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6, ease }}
          className="text-sm text-muted mt-4 md:hidden"
        >
          technologies detected and counting
        </motion.p>
      </div>
    </section>
  )
}
