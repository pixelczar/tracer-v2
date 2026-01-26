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

      {/* Site preview area */}
      <div className="aspect-[4/3] relative bg-gradient-to-br from-white/[0.02] to-transparent p-8 flex items-center justify-center">
        <motion.div
          key={sites[activeIndex].id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Stylized site representation */}
          <div className="mb-6 flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${sites[activeIndex].colors[2] || sites[activeIndex].colors[0]}, ${sites[activeIndex].colors[3] || sites[activeIndex].colors[1]})`
              }}
            >
              <img
                src={sites[activeIndex].favicon}
                alt=""
                className="w-10 h-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement!.textContent = sites[activeIndex].name[0].toUpperCase()
                }}
              />
            </div>
          </div>

          <h3 className="text-lg font-medium mb-2">{sites[activeIndex].name}</h3>

          {/* Color preview dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {sites[activeIndex].colors.slice(0, 5).map((color, i) => (
              <motion.div
                key={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', bounce: 0.5 }}
                className="w-3 h-3 rounded-full border border-white/10"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <p className="text-xs text-muted">
            {sites[activeIndex].tech.length} technologies detected
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
