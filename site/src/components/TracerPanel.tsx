import { motion } from 'framer-motion'
import type { SiteData } from '../data/sites'
import { ColorSwatches } from './ColorSwatches'
import { TypographyPreview } from './TypographyPreview'
import { TechGrid } from './TechGrid'

interface TracerPanelProps {
  site: SiteData
  onRefresh?: () => void
  embedded?: boolean
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
      {/* Panel header - matches real Tracer */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] bg-[#15181b]">
        <div className="flex items-center gap-2">
          {/* Tracer slash icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
            <path d="M4 12L8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium text-fg">Tracer</span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Pin button */}
          <button className="w-7 h-7 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1V8M7 8L4 5M7 8L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(45 7 7)"/>
            </svg>
          </button>
          {/* Close button */}
          <button className="w-7 h-7 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Site info row */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center gap-2.5">
        <img
          src={site.favicon}
          alt=""
          className="w-4 h-4 rounded-sm"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="text-sm text-fg flex-1 truncate">{site.name}</span>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="w-7 h-7 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7C2.5 4.51472 4.51472 2.5 7 2.5C8.63262 2.5 10.0648 3.36399 10.8469 4.65M11.5 7C11.5 9.48528 9.48528 11.5 7 11.5C5.36738 11.5 3.93519 10.636 3.15313 9.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10.5 2V5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 12V9H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Bookmark */}
          <button className="w-7 h-7 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors" title="Bookmark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 2.5H10.5V12L7 9.5L3.5 12V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Inspect/Edit */}
          <button className="w-7 h-7 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors" title="Inspect">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 10L8 6M8 6L10 4M8 6L6 4M8 6L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {/* Colors */}
        <section className="px-3 pt-4 pb-3">
          <h3 className="text-[11px] font-normal text-muted mb-3">
            Colors
          </h3>
          <ColorSwatches colors={site.colors} />
        </section>

        {/* Divider */}
        <div className="mx-3 border-b border-white/[0.06]" />

        {/* Typography */}
        <section className="px-3 pt-4 pb-3">
          <h3 className="text-[11px] font-normal text-muted mb-3">
            Typography
          </h3>
          <TypographyPreview fonts={site.typography} />
        </section>

        {/* Divider */}
        <div className="mx-3 border-b border-white/[0.06]" />

        {/* Tech */}
        <section className="px-3 pt-4 pb-4">
          <h3 className="text-[11px] font-normal text-muted mb-3">
            Tech <span className="text-fg/40 ml-1">{site.tech.length}</span>
          </h3>
          <TechGrid tech={site.tech} />
        </section>
      </div>
    </motion.div>
  )
}
