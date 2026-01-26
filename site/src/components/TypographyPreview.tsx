import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sexyEase = [0.16, 1, 0.3, 1] as const

interface Font {
  name: string
  weights: number[]
  preview: string
  fontFamily: string
}

interface TypographyPreviewProps {
  fonts: Font[]
}

export function TypographyPreview({ fonts }: TypographyPreviewProps) {
  const fontsKey = fonts.map((f) => f.name).join(',')

  return (
    <motion.div
      key={fontsKey}
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
          },
        },
      }}
      className="flex flex-col gap-0"
    >
      {fonts.map((font) => (
        <FontItem key={font.name} font={font} />
      ))}
    </motion.div>
  )
}

function FontItem({ font }: { font: Font }) {
  const sortedWeights = [...font.weights].sort((a, b) => a - b)
  const [activeWeight, setActiveWeight] = useState(sortedWeights[0])
  const hasMultipleWeights = sortedWeights.length > 1

  // Auto-cycle through weights every 8s (like real Tracer)
  useEffect(() => {
    if (!hasMultipleWeights) return
    const interval = setInterval(() => {
      setActiveWeight((currentWeight) => {
        const currentIndex = sortedWeights.indexOf(currentWeight)
        const nextIndex = (currentIndex + 1) % sortedWeights.length
        return sortedWeights[nextIndex]
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [hasMultipleWeights, sortedWeights])

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 1.0, ease: sexyEase }}
      className="flex flex-col gap-1 group"
    >
      {/* Header - font name + weight selector */}
      <div className="flex items-baseline justify-between px-0.5">
        <span className="flex items-center gap-1.5 font-medium text-[13px] text-fg">
          {font.name}
          {/* External link on hover */}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${font.name} font`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-accent"
            title={`Search for "${font.name} font"`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3.5 2H9.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 2.5L2.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </a>
        </span>

        {/* Weight selector with slashes */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {sortedWeights.map((w, i) => (
            <div key={w} className="flex items-center gap-1">
              <button
                onClick={() => setActiveWeight(w)}
                className={`
                  text-[10px] font-mono transition-all duration-200 px-0.5
                  ${activeWeight === w ? 'text-fg font-bold' : 'text-muted hover:text-accent'}
                `}
              >
                {w}
              </button>
              {i < sortedWeights.length - 1 && (
                <span className="text-muted/50 text-[9px] font-mono">/</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Specimen preview */}
      <div className="py-2 border-b border-white/[0.06] overflow-hidden min-h-[70px] relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeWeight}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: sexyEase }}
            className="w-full"
          >
            <p
              className="text-[22px] tracking-tight max-w-[280px] text-fg leading-[1.2]"
              style={{
                fontFamily: font.fontFamily,
                fontWeight: activeWeight,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              {font.preview}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
