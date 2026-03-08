import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import Lenis from 'lenis'
import { GrainOverlay } from './components/GrainOverlay'
import { MagneticButton } from './components/MagneticButton'
import { ScrambleText } from './components/ScrambleText'
import { Marquee } from './components/Marquee'

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/tracer/bngjllbgijacoakfcbcflhbedmdkegdo'
const ease = [0.16, 1, 0.3, 1] as const
const LETTERS = 'TRACER'.split('')

const features = [
  { number: '01', label: 'Colors', description: 'Every color extracted, organized by prominence. One-click copy in Hex, RGBA, HSL, OKLch.' },
  { number: '02', label: 'Typography', description: 'Fonts, weights, and live specimens. Variable font axis detection.' },
  { number: '03', label: 'Tech Stack', description: '6,800+ technologies. Frameworks, CDNs, infrastructure with confidence scoring.' },
]

function Crosshair({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2">
      <line x1="6" y1="0" x2="6" y2="12" />
      <line x1="0" y1="6" x2="12" y2="6" />
    </svg>
  )
}

function ChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  )
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  // Cursor gradient for hero text
  const gradientX = useMotionValue(50)
  const gradientY = useMotionValue(50)
  const springGX = useSpring(gradientX, { stiffness: 150, damping: 20 })
  const springGY = useSpring(gradientY, { stiffness: 150, damping: 20 })
  const gradient = useMotionTemplate`
    radial-gradient(600px circle at ${springGX}% ${springGY}%, rgba(234,255,0,0.15) 0%, transparent 60%),
    linear-gradient(to right, #f0f0f0, #f0f0f0)
  `
  const handleMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    gradientX.set(((e.clientX - rect.left) / rect.width) * 100)
    gradientY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <div className="min-h-screen bg-bg text-fg relative overflow-x-hidden">
      <GrainOverlay />

      {/* Grid lines — vertical rules */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="max-w-6xl mx-auto h-full relative px-6">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.04]" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/[0.04] hidden md:block" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/[0.04] hidden md:block" />
          <div className="absolute right-6 top-0 bottom-0 w-px bg-white/[0.04]" />
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-8 relative" onMouseMove={handleMove}>
        {/* Top rule */}
        <div className="w-full h-px bg-line mb-8 relative">
          <Crosshair className="absolute -left-1.5 -top-1.5" />
          <Crosshair className="absolute -right-1.5 -top-1.5" />
        </div>

        {/* Grid: title left-aligned, tagline + CTA on the right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="md:col-span-2 relative">
            {/* Outline layer */}
            <h1
              className="text-[22vw] md:text-[14vw] leading-[0.82] tracking-tight select-none"
              style={{ fontFamily: 'var(--font-display-outline)' }}
              aria-hidden="true"
            >
              <span className="flex">
                {LETTERS.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.12 }}
                    transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.06 }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            </h1>

            {/* Solid fill over outline */}
            <motion.h1
              className="text-[22vw] md:text-[14vw] leading-[0.82] tracking-tight select-none absolute inset-0"
              style={{
                fontFamily: 'var(--font-display)',
                backgroundImage: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease, delay: 0.5 }}
            >
              TRACER
            </motion.h1>
          </div>

          {/* Right column: tagline + CTA */}
          <motion.div
            className="flex flex-col gap-5 pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.9 }}
          >
            <p className="text-base text-muted leading-relaxed">
              See how any website is built — colors, typography, and tech stack for design engineers.
            </p>
            <div>
              <MagneticButton href={CHROME_STORE_URL}>
                <ChromeIcon />
                Add to Chrome — Free
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Bottom rule with label */}
        <div className="w-full h-px bg-line mt-8 relative">
          <Crosshair className="absolute -left-1.5 -top-1.5" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute left-4 -top-2.5 text-[9px] tracking-[0.25em] uppercase text-muted/30 font-mono bg-bg px-2"
          >
            Chrome Extension
          </motion.span>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <Marquee />

      {/* ═══ VIDEO ═══ */}
      <section className="max-w-6xl mx-auto px-6 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Label column */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="text-[10px] tracking-[0.25em] uppercase text-accent/50 font-mono mb-2">Preview</p>
            <p className="text-sm text-muted leading-relaxed">
              Open on any site. Colors, typography, and tech stack appear instantly in the side panel.
            </p>
          </motion.div>

          {/* Video — spans 2 columns */}
          <motion.div
            className="md:col-span-2 rounded-xl overflow-hidden border border-white/6 relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            {/* Scan line */}
            <motion.div
              className="absolute left-0 right-0 h-px pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(234,255,0,0.4) 50%, transparent)',
              }}
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            />
            {/* Replace with: <video src="/demo.mp4" autoPlay muted loop playsInline className="w-full" /> */}
            <div className="aspect-video bg-[#0a0a0a] flex items-center justify-center">
              <p className="text-muted/20 text-xs">demo.mp4</p>
            </div>
          </motion.div>
        </div>

        {/* Rule */}
        <div className="w-full h-px bg-line mt-12 relative">
          <Crosshair className="absolute -right-1.5 -top-1.5" />
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px md:gap-0">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
              className="p-6 border-b md:border-b-0 md:border-r border-white/6 last:border-0 group"
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-accent/40 mb-1 font-mono">
                {feature.number}
              </p>
              <ScrambleText
                text={feature.label}
                delay={2 + i * 0.2}
                className="text-sm tracking-[0.15em] uppercase text-fg mb-3 block font-semibold"
              />
              <p className="text-[13px] text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="max-w-6xl mx-auto px-6 py-12">
        {/* Top rule */}
        <div className="w-full h-px bg-line mb-10 relative">
          <Crosshair className="absolute -left-1.5 -top-1.5" />
          <Crosshair className="absolute -right-1.5 -top-1.5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Wordmark */}
          <p
            className="text-[8vw] md:text-[4vw] leading-none select-none text-white/[0.04]"
            style={{ fontFamily: 'var(--font-display-outline)' }}
          >
            TRACER
          </p>

          {/* Spacer */}
          <div />

          {/* CTA */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <MagneticButton href={CHROME_STORE_URL}>
              <ChromeIcon />
              Add to Chrome — Free
            </MagneticButton>
            <p className="text-xs text-muted/50">Free &middot; No account needed</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
