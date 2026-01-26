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
      {/* Chrome tab bar */}
      <div className="flex items-end gap-0 px-2 pt-2 bg-[#202124]">
        {sites.map((site, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={site.id}
              onClick={() => onSelect(index)}
              className={`
                relative group flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors min-w-[120px] max-w-[180px]
                ${isActive
                  ? 'bg-[#1a1d21] text-fg rounded-t-lg'
                  : 'text-muted hover:bg-white/5 rounded-t-lg'
                }
              `}
            >
              <img
                src={site.favicon}
                alt=""
                className="w-4 h-4 rounded-sm flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="truncate flex-1 text-left">{site.name.replace('.com', '').replace('.ai', '')}</span>

              {/* Close button */}
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'hover:bg-white/10' : 'opacity-0 group-hover:opacity-100 hover:bg-white/10'} transition-all`}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>

              {/* Progress bar for active tab */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.05 }}
                  />
                </div>
              )}
            </button>
          )
        })}

        {/* New tab button */}
        <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-white/5 transition-colors ml-1 mb-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* URL bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[#1a1d21] border-b border-white/5">
        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted/50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted/50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7C2.5 4.51472 4.51472 2.5 7 2.5C8.5 2.5 9.8 3.2 10.6 4.3M11.5 7C11.5 9.48528 9.48528 11.5 7 11.5C5.5 11.5 4.2 10.8 3.4 9.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* URL input */}
        <div className="flex-1 flex items-center gap-2 bg-[#292c31] rounded-full px-4 py-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted/70 flex-shrink-0">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-fg/80 truncate">{sites[activeIndex].url.replace('https://', '')}</span>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L7 3M7 11L7 13M1 7H3M11 7H13M2.75 2.75L4.17 4.17M9.83 9.83L11.25 11.25M11.25 2.75L9.83 4.17M4.17 9.83L2.75 11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 7.5L7 11L3.5 7.5M7 1V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
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
