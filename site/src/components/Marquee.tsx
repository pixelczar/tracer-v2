import { motion } from 'framer-motion'
import { useState } from 'react'

const ITEMS = Array(8).fill('COLORS \u00b7 TYPOGRAPHY \u00b7 TECH STACK')

export function Marquee() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="py-10 overflow-hidden border-y border-white/[0.04] relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="flex whitespace-nowrap gap-16"
        animate={{ x: [0, '-50%'] }}
        transition={{
          duration: hovered ? 50 : 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {ITEMS.map((text, i) => (
          <span
            key={i}
            className="text-[5vw] md:text-[3.5vw] text-white/[0.04] select-none shrink-0"
            style={{ fontFamily: 'var(--font-display-outline)' }}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
