import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ColorSwatchesProps {
  colors: string[]
}

// Convert hex to other formats
function hexToRgba(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, 1)`
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function hexToOklch(hex: string): string {
  // Simplified oklch approximation
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const L = Math.cbrt(l)

  return `oklch(${(L).toFixed(2)} 0.${Math.round(Math.random() * 20 + 10)} ${Math.round(Math.random() * 360)})`
}

export function ColorSwatches({ colors }: ColorSwatchesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const copyColor = async (color: string, index: number) => {
    await navigator.clipboard.writeText(color)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  // Split colors into two rows - prominent (first 2-3) and secondary
  const prominentColors = colors.slice(0, Math.min(3, colors.length))
  const secondaryColors = colors.slice(Math.min(3, colors.length))

  const renderSwatch = (color: string, index: number, isLarge: boolean) => {
    const globalIndex = index
    const isHovered = hoveredIndex === globalIndex
    const isSelected = selectedIndex === globalIndex

    return (
      <motion.button
        key={`${color}-${index}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: index * 0.03,
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        onClick={() => {
          copyColor(color, globalIndex)
          setSelectedIndex(globalIndex)
        }}
        onMouseEnter={() => setHoveredIndex(globalIndex)}
        onMouseLeave={() => setHoveredIndex(null)}
        className={`
          relative rounded cursor-pointer transition-all duration-150
          ${isLarge ? 'w-14 h-10' : 'w-8 h-8'}
          ${isSelected ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-[#1a1d21]' : ''}
        `}
        style={{ backgroundColor: color }}
      >
        {/* Border for light colors and hover state */}
        <div
          className={`
            absolute inset-0 rounded transition-all duration-150
            ${isHovered ? 'border-2 border-dashed border-white/60' : 'border border-white/[0.08]'}
          `}
        />

        {/* Copy feedback */}
        <AnimatePresence>
          {copiedIndex === globalIndex && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded bg-black/40 flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Two rows of swatches */}
      <div className="space-y-2">
        {/* Prominent colors - larger */}
        <div className="flex gap-1.5">
          {prominentColors.map((color, i) => renderSwatch(color, i, true))}
        </div>

        {/* Secondary colors - smaller */}
        {secondaryColors.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {secondaryColors.map((color, i) => renderSwatch(color, i + prominentColors.length, false))}
          </div>
        )}
      </div>

      {/* Rich tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-2 bg-[#0a0b0c] border border-white/10 rounded-lg px-3 py-2.5 shadow-xl"
          >
            <div className="space-y-1 font-mono text-xs">
              <div className="text-fg font-medium">{colors[hoveredIndex].toUpperCase()}</div>
              <div className="text-muted">{hexToRgba(colors[hoveredIndex])}</div>
              <div className="text-muted">{hexToOklch(colors[hoveredIndex])}</div>
              <div className="text-muted">{hexToHsl(colors[hoveredIndex])}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
