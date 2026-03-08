import { motion, useScroll, useTransform } from 'framer-motion'
import { MagneticButton } from './MagneticButton'

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/tracer/bngjllbgijacoakfcbcflhbedmdkegdo'

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

export function Footer() {
  const { scrollYProgress } = useScroll()
  const footerY = useTransform(scrollYProgress, [0.7, 1], [80, 0])
  const footerOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 0.03])

  return (
    <footer className="px-6 pb-24 text-center relative">
      {/* Rising ghost wordmark */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end justify-center overflow-hidden pointer-events-none select-none"
        style={{ height: '50vh' }}
      >
        <motion.p
          className="text-[28vw] leading-[0.8] text-transparent whitespace-nowrap translate-y-[30%]"
          style={{
            fontFamily: 'var(--font-display-outline)',
            WebkitTextStroke: '1px rgba(255,255,255,0.04)',
            y: footerY,
            opacity: footerOpacity,
          }}
        >
          TRACER
        </motion.p>
      </div>

      <div className="relative z-10">
        <MagneticButton href={CHROME_STORE_URL}>
          <ChromeIcon />
          Add to Chrome — Free
        </MagneticButton>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-5 text-sm text-muted"
        >
          Free &middot; No account needed
        </motion.p>
      </div>
    </footer>
  )
}
