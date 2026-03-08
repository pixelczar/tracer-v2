import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'

export function MagneticButton({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set(dx * 0.3)
    y.set(dy * 0.3)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="relative inline-flex items-center gap-3 px-7 py-3.5 bg-accent text-black text-sm font-semibold rounded-full overflow-hidden group"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </motion.a>
  )
}
