import { useState } from 'react'
import { motion } from 'framer-motion'

interface ColorSwatchesProps {
  colors: string[]
}

export function ColorSwatches({ colors }: ColorSwatchesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const copyColor = async (color: string, index: number) => {
    await navigator.clipboard.writeText(color)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {colors.map((color, index) => (
        <motion.button
          key={`${color}-${index}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: index * 0.04,
            type: 'spring',
            stiffness: 500,
            damping: 25,
          }}
          onClick={() => copyColor(color, index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative aspect-square rounded-lg cursor-pointer group"
          style={{ backgroundColor: color }}
        >
          {/* Border for light colors */}
          <div className="absolute inset-0 rounded-lg border border-white/10" />

          {/* Hover/active states */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-black/20 flex items-center justify-center"
            initial={false}
            animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
          >
            {copiedIndex === index ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/80">
                <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 8V2.5C2 2.22386 2.22386 2 2.5 2H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </motion.div>
        </motion.button>
      ))}

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-0 bg-black/90 text-xs font-mono px-2 py-1 rounded text-white"
        >
          {colors[hoveredIndex]}
        </motion.div>
      )}
    </div>
  )
}
