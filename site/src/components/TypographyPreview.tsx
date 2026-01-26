import { useState } from 'react'
import { motion } from 'framer-motion'

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
  return (
    <div className="space-y-0">
      {fonts.map((font, index) => (
        <FontItem key={font.name} font={font} index={index} isLast={index === fonts.length - 1} />
      ))}
    </div>
  )
}

function FontItem({ font, index, isLast }: { font: Font; index: number; isLast: boolean }) {
  const [selectedWeight, setSelectedWeight] = useState(font.weights[0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group"
    >
      {/* Font name and weight selector */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-fg">{font.name}</span>

        {/* Weight pills with slashes */}
        <div className="flex items-center gap-0">
          {font.weights.map((weight, i) => (
            <div key={weight} className="flex items-center">
              <button
                onClick={() => setSelectedWeight(weight)}
                className={`
                  px-0.5 py-0.5 text-xs font-mono transition-colors cursor-pointer
                  ${selectedWeight === weight ? 'text-fg font-medium' : 'text-muted hover:text-fg/70'}
                `}
              >
                {weight}
              </button>
              {i < font.weights.length - 1 && (
                <span className="text-muted/50 text-xs mx-1">/</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview text */}
      <motion.p
        key={selectedWeight}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="text-xl leading-snug text-fg/90 line-clamp-2"
        style={{
          fontFamily: font.fontFamily,
          fontWeight: selectedWeight,
        }}
      >
        {font.preview}
      </motion.p>

      {/* Divider */}
      {!isLast && (
        <div className="my-4 border-b border-white/[0.06]" />
      )}
    </motion.div>
  )
}
