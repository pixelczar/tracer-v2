import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SiteData } from '../data/sites'
import { CursorBubble } from './CursorBubble'

interface BrowserMockupProps {
  sites: SiteData[]
  activeIndex: number
  progress: number
  onSelect: (index: number) => void
}

export function BrowserMockup({ sites, activeIndex, progress, onSelect }: BrowserMockupProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CursorBubble visible={isHovered} />

      {/* Chrome tab bar */}
      <div className="flex items-end gap-0 px-2 pt-2 bg-[#202124]">
        {sites.map((site, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={site.id}
              onClick={() => onSelect(index)}
              className={`
                relative flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors min-w-[100px] max-w-[160px]
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
        <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:bg-white/5 transition-colors ml-1 mb-1">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* URL bar */}
      <div className="flex items-center gap-2 px-2 py-1.5 bg-[#1a1d21]">
        {/* Nav buttons */}
        <div className="flex items-center">
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted/40">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted/40">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:bg-white/5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6a4 4 0 0 1 4-4 4.5 4.5 0 0 1 3 1.2M10 6a4 4 0 0 1-4 4 4.5 4.5 0 0 1-3-1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* URL input */}
        <div className="flex-1 flex items-center gap-2 bg-[#292c31] rounded-full px-3 py-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted/60 flex-shrink-0">
            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-xs text-fg/70 truncate">{sites[activeIndex].url.replace('https://', '')}</span>
        </div>
      </div>

      {/* Page content wireframe */}
      <div className="flex-1 relative overflow-hidden bg-[#0d0f11]">
        <motion.div
          key={sites[activeIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full p-4"
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

            {/* Scan line effect */}
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
        <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-accent/30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-accent/30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-accent/30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-accent/30" />
      </div>
    </div>
  )
}
