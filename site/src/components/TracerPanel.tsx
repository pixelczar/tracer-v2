import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SiteData } from '../data/sites'
import { ColorSwatches } from './ColorSwatches'
import { TypographyPreview } from './TypographyPreview'
import { TechGrid } from './TechGrid'
import { ScrambleText } from './ScrambleText'

interface TracerPanelProps {
  site: SiteData
  onRefresh?: () => void
  embedded?: boolean
}

function SectionHeader({ text, isHovered, count }: { text: string; isHovered: boolean; count?: number }) {
  return (
    <h3 className="text-[12px] text-muted mb-2 flex items-center">
      <span className="inline-block min-w-[4ch]">
        <ScrambleText text={text} trigger={isHovered} />
      </span>
      {count !== undefined && (
        <span className="ml-2 text-[10px] font-mono text-muted">
          {count}
        </span>
      )}
    </h3>
  )
}

function Section({ children, title, count }: { children: React.ReactNode; title: string; count?: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section
      className="px-3 py-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SectionHeader text={title} isHovered={isHovered} count={count} />
      {children}
    </section>
  )
}

export function TracerPanel({ site, onRefresh, embedded }: TracerPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-[#1a1d21] flex flex-col h-full ${embedded ? '' : 'max-w-[360px] border border-white/[0.08] rounded-lg overflow-hidden shadow-2xl shadow-black/50'}`}
    >
      {/* Panel header - "// Tracer" with simple slashes */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#15181b]">
        <div className="flex items-center gap-2">
          {/* Simple slashes icon like real Tracer */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M7 20L12 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 20L17 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium text-fg">Tracer</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Pin button */}
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L12 12M12 12L8 8M12 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 12 12)"/>
            </svg>
          </button>
          {/* Close button */}
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Inset content area like Chrome side panel */}
      <div className="flex-1 overflow-hidden bg-[#121417] m-1 rounded-lg flex flex-col">
        {/* Site info row */}
        <div className="px-3 py-2.5 flex items-center gap-2">
          <img
            src={site.favicon}
            alt=""
            className="w-4 h-4 rounded-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <span className="text-[13px] text-fg flex-1 truncate">{site.name}</span>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors"
              title="Refresh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors" title="Bookmark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 3v18l7-5 7 5V3H5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors" title="Inspect">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 4l4.5 16.5 3.5-5.5 5 5 2.5-2.5-5-5 5.5-3.5L4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <Section title="Colors">
            <ColorSwatches colors={site.colors} />
          </Section>

          <div className="mx-3 border-b border-white/[0.06]" />

          <Section title="Typography">
            <TypographyPreview fonts={site.typography} />
          </Section>

          <div className="mx-3 border-b border-white/[0.06]" />

          <Section title="Tech" count={site.tech.length}>
            <TechGrid tech={site.tech} />
          </Section>
        </div>
      </div>
    </motion.div>
  )
}
