import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { MagneticButton } from './MagneticButton'

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/tracer/bngjllbgijacoakfcbcflhbedmdkegdo'
const ease = [0.16, 1, 0.3, 1] as const
const LETTERS = 'TRACER'.split('')

export function Hero() {
  // Cursor-following gradient for the filled text
  const gradientX = useMotionValue(50)
  const gradientY = useMotionValue(50)
  const springGX = useSpring(gradientX, { stiffness: 150, damping: 20 })
  const springGY = useSpring(gradientY, { stiffness: 150, damping: 20 })

  const gradient = useMotionTemplate`
    radial-gradient(
      600px circle at ${springGX}% ${springGY}%,
      rgba(234,255,0,0.18) 0%,
      transparent 60%
    ),
    linear-gradient(to right, #f0f0f0 0%, #f0f0f0 100%)
  `

  const handleMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    gradientX.set(((e.clientX - rect.left) / rect.width) * 100)
    gradientY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 pt-24 pb-16 relative">
      <div className="flex flex-col items-center" onMouseMove={handleMove}>
        <div className="relative">
          {/* Layer 1: Outline — fades in first */}
          <h1
            className="text-[20vw] md:text-[16vw] lg:text-[14vw] leading-[0.85] tracking-tight text-center select-none relative"
            style={{ fontFamily: 'var(--font-display-outline)' }}
            aria-hidden="true"
          >
            <span className="flex justify-center">
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.06 }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Layer 2: Solid fill — fades in over the outline with cursor gradient */}
          <motion.h1
            className="text-[20vw] md:text-[16vw] lg:text-[14vw] leading-[0.85] tracking-tight text-center select-none absolute inset-0"
            style={{
              fontFamily: 'var(--font-display)',
              backgroundImage: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease, delay: 0.6 }}
          >
            TRACER
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 1.0 }}
          className="mt-6 text-lg md:text-xl text-muted text-center max-w-md"
        >
          See how any website is built.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease, delay: 1.3 }}
          className="mt-6"
        >
          <MagneticButton href={CHROME_STORE_URL}>
            <ChromeIcon />
            Add to Chrome — Free
          </MagneticButton>
        </motion.div>
      </div>
    </section>
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
