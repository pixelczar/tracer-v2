import { motion } from 'framer-motion'
import type { SiteData } from '../data/sites'
import { BlinkingCursor } from './BlinkingCursor'

interface SiteSelectorProps {
  sites: SiteData[]
  activeIndex: number
  progress: number
  onSelect: (index: number) => void
}

export function SiteSelector({ sites, activeIndex, progress, onSelect }: SiteSelectorProps) {
  return (
    <div className="flex flex-col">
      {/* Blurb */}
      <p className="text-lg md:text-xl text-muted max-w-xl leading-relaxed mb-6">
        See how any website is built — <span className="text-fg">colors</span>,{' '}
        <span className="text-fg">typography</span>, and{' '}
        <span className="text-fg">tech stack</span> for design engineers.<BlinkingCursor className="ml-1" />
      </p>

      {/* Browser mockup */}
      <div className="bg-faint/50 rounded-xl border border-white/5 overflow-hidden flex-1">
        {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white/5 rounded-md px-3 py-1.5 text-xs text-muted font-mono truncate">
            {sites[activeIndex].url}
          </div>
        </div>
      </div>

      {/* Site tabs */}
      <div className="flex border-b border-white/5">
        {sites.map((site, index) => (
          <button
            key={site.id}
            onClick={() => onSelect(index)}
            className={`
              relative flex-1 px-3 py-3 text-xs font-medium transition-colors
              ${index === activeIndex ? 'text-fg' : 'text-muted hover:text-fg/70'}
            `}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <img
                src={site.favicon}
                alt=""
                className="w-4 h-4 rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="hidden sm:inline">{site.name.replace('.com', '').replace('.ai', '')}</span>
            </span>

            {/* Active indicator */}
            {index === activeIndex && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/5"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}

            {/* Progress bar */}
            {index === activeIndex && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                <motion.div
                  className="h-full bg-accent"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Site preview area - blueprint wireframe */}
      <div className="aspect-[4/3] relative p-6 overflow-hidden">
        <motion.div
          key={sites[activeIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full relative"
        >
          {/* Blueprint wireframe layout */}
          <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" preserveAspectRatio="xMidYMid slice">
            {/* Nav bar */}
            <motion.rect
              x="20" y="16" width="360" height="24" rx="2"
              stroke="currentColor" strokeWidth="1" fill="none"
              className="text-white/20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />
            <motion.rect
              x="28" y="22" width="40" height="12" rx="1"
              className="fill-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <rect x="280" y="22" width="24" height="12" rx="1" className="fill-white/10" />
              <rect x="310" y="22" width="24" height="12" rx="1" className="fill-white/10" />
              <rect x="340" y="22" width="32" height="12" rx="2" className="fill-accent/30" />
            </motion.g>

            {/* Hero section */}
            <motion.rect
              x="20" y="56" width="360" height="100" rx="2"
              stroke="currentColor" strokeWidth="1" fill="none"
              className="text-white/15"
              strokeDasharray="4 2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <motion.rect
              x="40" y="76" width="180" height="16" rx="1"
              className="fill-white/10"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              style={{ transformOrigin: 'left' }}
            />
            <motion.rect
              x="40" y="100" width="140" height="8" rx="1"
              className="fill-white/5"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
            <motion.rect
              x="40" y="114" width="100" height="8" rx="1"
              className="fill-white/5"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.65, duration: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
            <motion.rect
              x="40" y="134" width="60" height="20" rx="2"
              className="fill-accent/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            />

            {/* Content grid */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              <rect x="20" y="172" width="112" height="80" rx="2" stroke="currentColor" strokeWidth="1" fill="none" className="text-white/15" />
              <rect x="28" y="180" width="96" height="40" rx="1" className="fill-white/5" />
              <rect x="28" y="228" width="60" height="6" rx="1" className="fill-white/10" />
              <rect x="28" y="238" width="80" height="6" rx="1" className="fill-white/5" />
            </motion.g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
              <rect x="144" y="172" width="112" height="80" rx="2" stroke="currentColor" strokeWidth="1" fill="none" className="text-white/15" />
              <rect x="152" y="180" width="96" height="40" rx="1" className="fill-white/5" />
              <rect x="152" y="228" width="60" height="6" rx="1" className="fill-white/10" />
              <rect x="152" y="238" width="80" height="6" rx="1" className="fill-white/5" />
            </motion.g>
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
              <rect x="268" y="172" width="112" height="80" rx="2" stroke="currentColor" strokeWidth="1" fill="none" className="text-white/15" />
              <rect x="276" y="180" width="96" height="40" rx="1" className="fill-white/5" />
              <rect x="276" y="228" width="60" height="6" rx="1" className="fill-white/10" />
              <rect x="276" y="238" width="80" height="6" rx="1" className="fill-white/5" />
            </motion.g>

            {/* Scan line effect */}
            <motion.rect
              x="0" y="0" width="400" height="4"
              className="fill-accent/20"
              initial={{ y: 0 }}
              animate={{ y: 300 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </svg>

          {/* Corner markers */}
          <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-accent/40" />
          <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-accent/40" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-accent/40" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-accent/40" />
        </motion.div>
      </div>
      </div>
    </div>
  )
}
