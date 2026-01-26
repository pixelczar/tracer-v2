import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

interface CursorBubbleProps {
  visible: boolean
}

export function CursorBubble({ visible }: CursorBubbleProps) {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const [showUnderscore, setShowUnderscore] = useState(true)
  const bubbleRef = useRef<HTMLDivElement>(null)

  const springConfig = { damping: 25, stiffness: 400 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    if (!visible) return

    const updatePosition = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        if (!bubbleRef.current) {
          cursorX.set(e.clientX + 12)
          cursorY.set(e.clientY + 12)
          return
        }

        const bubbleRect = bubbleRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        const offsetX = 12
        const offsetY = 12

        let adjustedX = e.clientX + offsetX
        let adjustedY = e.clientY + offsetY

        if (adjustedX + bubbleRect.width > viewportWidth) {
          adjustedX = e.clientX - bubbleRect.width - offsetX
        }
        if (adjustedX < 0) adjustedX = offsetX
        if (adjustedY + bubbleRect.height > viewportHeight) {
          adjustedY = e.clientY - bubbleRect.height - offsetY
        }
        if (adjustedY < 0) adjustedY = offsetY

        cursorX.set(adjustedX)
        cursorY.set(adjustedY)
      })
    }

    window.addEventListener('mousemove', updatePosition)
    return () => window.removeEventListener('mousemove', updatePosition)
  }, [visible, cursorX, cursorY])

  // Blinking underscore
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setShowUnderscore((s) => !s)
    }, 530)
    return () => clearInterval(interval)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={bubbleRef}
          className="fixed top-0 left-0 pointer-events-none z-[9999]"
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          <div className="bg-[#0a0a0a] border border-white/10 rounded-md px-2.5 py-1.5 shadow-xl">
            <span className="text-accent font-mono text-xs tracking-wide">
              //{showUnderscore ? '_' : '\u00A0'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
