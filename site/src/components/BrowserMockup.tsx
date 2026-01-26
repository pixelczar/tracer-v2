import { motion } from 'framer-motion'
import type { SiteData } from '../data/sites'

interface BrowserMockupProps {
  sites: SiteData[]
  activeIndex: number
  progress: number
  onSelect: (index: number) => void
}

export function BrowserMockup({ sites, activeIndex, progress, onSelect }: BrowserMockupProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[#15181b]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white/5 rounded-md px-3 py-1.5 text-xs text-muted font-mono truncate max-w-md">
            {sites[activeIndex].url}
          </div>
        </div>
      </div>

      {/* Site tabs */}
      <div className="flex border-b border-white/5 bg-[#15181b]/50">
        {sites.map((site, index) => (
          <button
            key={site.id}
            onClick={() => onSelect(index)}
            className={`
              relative flex-1 px-3 py-2.5 text-xs font-medium transition-colors
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

      {/* Page content wireframe */}
      <div className="flex-1 relative overflow-hidden bg-[#0d0f11]">
        <motion.div
          key={sites[activeIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full p-6"
        >
          <svg className="w-full h-full" viewBox="0 0 500 340" fill="none" preserveAspectRatio="xMidYMid meet">
            {/* Sidebar */}
            <motion.rect
              x="0" y="0" width="48" height="340"
              className="fill-white/[0.02]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <rect x="14" y="16" width="20" height="20" rx="4" className="fill-white/10" />
              <rect x="14" y="48" width="20" height="20" rx="2" className="fill-white/5" />
              <rect x="14" y="76" width="20" height="20" rx="2" className="fill-white/5" />
              <rect x="14" y="104" width="20" height="20" rx="2" className="fill-white/5" />
              <rect x="14" y="132" width="20" height="20" rx="2" className="fill-white/5" />
            </motion.g>

            {/* Main content area */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              {/* Hero centered content */}
              <rect x="140" y="60" width="220" height="28" rx="4" className="fill-white/10" />
              <rect x="180" y="100" width="140" height="12" rx="2" className="fill-white/5" />

              {/* Input box */}
              <rect x="100" y="140" width="300" height="56" rx="8" stroke="currentColor" strokeWidth="1" className="text-white/10" fill="none" />
              <rect x="116" y="156" width="160" height="10" rx="2" className="fill-white/5" />
              <circle cx="376" cy="168" r="12" className="fill-accent/30" />

              {/* Action chips */}
              <rect x="140" y="216" width="56" height="24" rx="12" stroke="currentColor" strokeWidth="1" className="text-white/10" fill="none" />
              <rect x="204" y="216" width="48" height="24" rx="12" stroke="currentColor" strokeWidth="1" className="text-white/10" fill="none" />
              <rect x="260" y="216" width="52" height="24" rx="12" stroke="currentColor" strokeWidth="1" className="text-white/10" fill="none" />
              <rect x="320" y="216" width="60" height="24" rx="12" stroke="currentColor" strokeWidth="1" className="text-white/10" fill="none" />
            </motion.g>

            {/* Notification icon top right */}
            <motion.circle
              cx="476" cy="20" r="8"
              className="fill-white/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            />

            {/* Scan line effect - slower */}
            <motion.rect
              x="48" y="0" width="452" height="2"
              className="fill-accent/15"
              initial={{ y: 0 }}
              animate={{ y: 340 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </motion.div>

        {/* Corner markers */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-accent/30" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-accent/30" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-accent/30" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-accent/30" />
      </div>
    </div>
  )
}
