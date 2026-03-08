import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.16, 1, 0.3, 1] as const

function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotation = { tl: 0, tr: 90, bl: 270, br: 180 }[position]
  const style: React.CSSProperties = {
    position: 'absolute',
    ...(position.includes('t') ? { top: -12 } : { bottom: -12 }),
    ...(position.includes('l') ? { left: -12 } : { right: -12 }),
  }

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.3, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6, ease }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(234,255,0,0.4)" strokeWidth="1" style={{ transform: `rotate(${rotation}deg)` }}>
        <path d="M2 12 L2 2 L12 2" />
      </svg>
    </motion.div>
  )
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none z-10"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(234,255,0,0.3) 30%, rgba(234,255,0,0.6) 50%, rgba(234,255,0,0.3) 70%, transparent 100%)',
      }}
      initial={{ top: '0%' }}
      animate={{ top: '100%' }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
        repeatDelay: 2,
      }}
    />
  )
}

export function VideoSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll-linked entry
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  })
  const videoScale = useTransform(scrollYProgress, [0, 1], [0.88, 1])
  const videoY = useTransform(scrollYProgress, [0, 1], [60, 0])

  // 3D tilt on mouse
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRX = useSpring(rotateX, { stiffness: 150, damping: 20 })
  const springRY = useSpring(rotateY, { stiffness: 150, damping: 20 })

  // Ambient glow follows mouse
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)
  const springGlowX = useSpring(glowX, { stiffness: 100, damping: 25 })
  const springGlowY = useSpring(glowY, { stiffness: 100, damping: 25 })

  const glowGradient = useMotionTemplate`
    radial-gradient(
      500px circle at ${springGlowX}% ${springGlowY}%,
      rgba(234,255,0,0.1),
      transparent 70%
    )
  `

  const handleMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rotateX.set(y * -6)
    rotateY.set(x * 6)
    glowX.set(((e.clientX - rect.left) / rect.width) * 100)
    glowY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const handleLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }

  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="text-center text-[11px] tracking-[0.25em] uppercase text-muted/60 mb-10 font-medium"
        >
          Colors &middot; Typography &middot; Tech Stack
        </motion.p>

        <motion.div
          ref={containerRef}
          className="relative"
          style={{
            perspective: 1200,
            scale: videoScale,
            y: videoY,
          }}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute -inset-16 rounded-3xl blur-3xl pointer-events-none"
            style={{ background: glowGradient }}
          />

          {/* Corner brackets */}
          <CornerBracket position="tl" />
          <CornerBracket position="tr" />
          <CornerBracket position="bl" />
          <CornerBracket position="br" />

          {/* Video container with 3D tilt */}
          <motion.div
            className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/40 relative"
            style={{
              rotateX: springRX,
              rotateY: springRY,
              transformStyle: 'preserve-3d',
            }}
          >
            <ScanLine />
            {/* Replace placeholder with: <video src="/demo.mp4" autoPlay muted loop playsInline className="w-full" /> */}
            <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: 'radial-gradient(circle, #f0f0f0 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }} />
              <div className="text-center relative z-10">
                <p className="text-muted/30 text-sm">demo.mp4</p>
                <p className="text-muted/15 text-xs mt-1">Record with Screens Studio → site/public/</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
