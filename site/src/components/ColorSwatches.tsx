import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

interface ColorSwatchesProps {
  colors: string[]
}

const sexyEase = [0.16, 1, 0.3, 1] as const

// Color conversion utilities (same as real Tracer)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

function rgbToRgba(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, 1)`
}

function rgbToHsl(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break
      case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break
      case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function rgbToOklch(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const linearR = r / 255, linearG = g / 255, linearB = b / 255
  const srgbR = linearR <= 0.04045 ? linearR / 12.92 : Math.pow((linearR + 0.055) / 1.055, 2.4)
  const srgbG = linearG <= 0.04045 ? linearG / 12.92 : Math.pow((linearG + 0.055) / 1.055, 2.4)
  const srgbB = linearB <= 0.04045 ? linearB / 12.92 : Math.pow((linearB + 0.055) / 1.055, 2.4)
  const labL = 0.4122214708 * srgbR + 0.5363325363 * srgbG + 0.0514459929 * srgbB
  const labM = 0.2119034982 * srgbR + 0.6806995451 * srgbG + 0.1073969566 * srgbB
  const labS = 0.0883024619 * srgbR + 0.2817188376 * srgbG + 0.6299787005 * srgbB
  const l_ = Math.cbrt(labL), m_ = Math.cbrt(labM), s_ = Math.cbrt(labS)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const C = Math.sqrt(a * a + bLab * bLab)
  let h = Math.atan2(bLab, a) * (180 / Math.PI)
  if (h < 0) h += 360
  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${h.toFixed(2)})`
}

// Cursor-following tooltip
function ColorTooltip({ hex, visible, copiedFormatKey }: { hex: string; visible: boolean; copiedFormatKey: string | null }) {
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 400 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    if (!visible) return
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX + 12)
      cursorY.set(e.clientY + 12)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [visible, cursorX, cursorY])

  const formats = [
    { key: 'hex', value: hex.toUpperCase() },
    { key: 'rgba', value: rgbToRgba(hex) },
    { key: 'oklch', value: rgbToOklch(hex) },
    { key: 'hsl', value: rgbToHsl(hex) },
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9999] bg-[#0a0a0a] text-white px-3 py-2 text-[10px] font-mono shadow-lg border border-white/5 rounded-lg"
          style={{ x, y }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: sexyEase }}
        >
          <div className="flex flex-col gap-1">
            {formats.map((format) => {
              const isCopied = copiedFormatKey === format.key
              const isHex = format.key === 'hex'
              return (
                <div key={format.key} className={isHex ? 'uppercase tracking-wider text-white' : 'text-white/70'}>
                  <AnimatePresence mode="wait" initial={false}>
                    {isCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.3, ease: sexyEase }}
                      >
                        COPIED
                      </motion.span>
                    ) : (
                      <motion.span
                        key="value"
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.3, ease: sexyEase }}
                      >
                        {format.value}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ColorSwatches({ colors }: ColorSwatchesProps) {
  const [hoveredHex, setHoveredHex] = useState<string | null>(null)
  const [copiedFormatKey, setCopiedFormatKey] = useState<string | null>(null)
  const [formatKeyMap, setFormatKeyMap] = useState<Map<string, string>>(new Map())
  const [selectorPosition, setSelectorPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const swatchRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Large swatches for first 2 prominent colors
  const maxLarge = 2
  let largeCount = 0

  const handleCopy = (hex: string) => {
    const formats = ['hex', 'rgba', 'oklch', 'hsl']
    const currentFormatKey = formatKeyMap.get(hex) ?? 'hex'
    const currentIndex = formats.indexOf(currentFormatKey)
    const formatValues: Record<string, string> = {
      hex: hex.toUpperCase(),
      rgba: rgbToRgba(hex),
      oklch: rgbToOklch(hex),
      hsl: rgbToHsl(hex),
    }
    navigator.clipboard.writeText(formatValues[currentFormatKey])
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    setCopiedFormatKey(currentFormatKey)
    setHoveredHex(hex)
    const nextIndex = (currentIndex + 1) % formats.length
    setFormatKeyMap(new Map(formatKeyMap.set(hex, formats[nextIndex])))
    copyTimeoutRef.current = setTimeout(() => setCopiedFormatKey(null), 800)
  }

  // Update selector position
  useEffect(() => {
    if (!hoveredHex) {
      setSelectorPosition(null)
      return
    }
    const swatchElement = swatchRefs.current.get(hoveredHex)
    const containerElement = containerRef.current
    if (swatchElement && containerElement) {
      const swatchRect = swatchElement.getBoundingClientRect()
      const containerRect = containerElement.getBoundingClientRect()
      setSelectorPosition({
        x: swatchRect.left - containerRect.left,
        y: swatchRect.top - containerRect.top,
        width: swatchRect.width,
        height: swatchRect.height,
      })
    }
  }, [hoveredHex])

  return (
    <>
      <ColorTooltip hex={hoveredHex || ''} visible={hoveredHex !== null || copiedFormatKey !== null} copiedFormatKey={copiedFormatKey} />
      <div ref={containerRef} className="relative">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } } }}
          className="grid grid-cols-9 gap-1.5"
          style={{ gridAutoRows: '24px' }}
        >
          {colors.map((color, index) => {
            // First 2 high-weight colors are large
            const shouldBeLarge = index < 2 && largeCount < maxLarge
            if (shouldBeLarge) largeCount++

            return (
              <motion.button
                key={color}
                ref={(el) => {
                  if (el) swatchRefs.current.set(color, el)
                  else swatchRefs.current.delete(color)
                }}
                onClick={() => handleCopy(color)}
                onMouseEnter={() => {
                  if (copiedFormatKey === null) {
                    setHoveredHex(color)
                    if (!formatKeyMap.has(color)) {
                      setFormatKeyMap(new Map(formatKeyMap.set(color, 'hex')))
                    }
                  }
                }}
                onMouseLeave={() => {
                  if (copiedFormatKey === null) setHoveredHex(null)
                }}
                variants={{
                  hidden: { opacity: 0, y: 8, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.7, ease: sexyEase }}
                className={`relative cursor-pointer rounded-sm ${shouldBeLarge ? 'col-span-2 row-span-2' : ''}`}
                style={{ backgroundColor: color }}
              >
                <div className="absolute inset-0 rounded-sm ring-1 ring-inset ring-black/20 pointer-events-none" />
              </motion.button>
            )
          })}
        </motion.div>

        {/* Animated corner selector */}
        <AnimatePresence>
          {selectorPosition && (
            <motion.div
              className="absolute pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: selectorPosition.x,
                top: selectorPosition.y,
                width: selectorPosition.width,
                height: selectorPosition.height,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.15 } }}
            >
              {/* Corner brackets */}
              <div className="absolute w-2 h-2" style={{ top: -2, left: -2, borderTop: '1px solid rgba(240,240,240,0.8)', borderLeft: '1px solid rgba(240,240,240,0.8)' }} />
              <div className="absolute w-2 h-2" style={{ top: -2, right: -2, borderTop: '1px solid rgba(240,240,240,0.8)', borderRight: '1px solid rgba(240,240,240,0.8)' }} />
              <div className="absolute w-2 h-2" style={{ bottom: -2, left: -2, borderBottom: '1px solid rgba(240,240,240,0.8)', borderLeft: '1px solid rgba(240,240,240,0.8)' }} />
              <div className="absolute w-2 h-2" style={{ bottom: -2, right: -2, borderBottom: '1px solid rgba(240,240,240,0.8)', borderRight: '1px solid rgba(240,240,240,0.8)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
