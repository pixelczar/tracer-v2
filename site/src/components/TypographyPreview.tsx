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
    <div className="space-y-4">
      {fonts.map((font, index) => (
        <motion.div
          key={font.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="group"
        >
          {/* Font name and weights */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-medium">{font.name}</span>
            <div className="flex gap-2">
              {font.weights.map((weight, i) => (
                <span
                  key={weight}
                  className={`text-xs font-mono ${i === 0 ? 'text-fg' : 'text-muted'}`}
                >
                  {weight}
                </span>
              ))}
            </div>
          </div>

          {/* Preview text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="text-lg leading-snug text-fg/80 truncate"
            style={{ fontFamily: font.fontFamily }}
          >
            {font.preview}
          </motion.p>

          {/* Divider */}
          {index < fonts.length - 1 && (
            <div className="mt-4 border-b border-white/5" />
          )}
        </motion.div>
      ))}
    </div>
  )
}
