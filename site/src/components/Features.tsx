import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ScrambleText } from './ScrambleText'

const ease = [0.16, 1, 0.3, 1] as const

const features = [
  {
    number: '01',
    label: 'Colors',
    description: 'Every color extracted, organized by prominence. One-click copy in Hex, RGBA, HSL, OKLch.',
  },
  {
    number: '02',
    label: 'Typography',
    description: 'Fonts, weights, and live specimens. Variable font axis detection.',
  },
  {
    number: '03',
    label: 'Tech Stack',
    description: '6,800+ technologies detected. Frameworks, CDNs, infrastructure with confidence scoring.',
  },
]

export function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="px-6 py-16">
      <div
        ref={ref}
        className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease, delay: i * 0.12 }}
            className="group rounded-xl border border-white/6 bg-white/2 p-5 hover:border-white/12 hover:bg-white/4 transition-all duration-300"
          >
            <p className="text-[10px] tracking-[0.2em] uppercase text-accent/60 mb-1 font-mono">
              {feature.number}
            </p>
            <ScrambleText
              text={feature.label}
              delay={1.5 + i * 0.2}
              className="text-sm tracking-[0.15em] uppercase text-fg mb-3 block font-semibold"
            />
            <p className="text-[13px] text-muted leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
