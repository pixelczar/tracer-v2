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
      {/* Panel header - matches real Tracer exactly */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-[#15181b]">
        <div className="flex items-center gap-2">
          {/* Tracer slash icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
            <path d="M4 13L8 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M8 13L12 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium text-fg">Tracer</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Pin button - pushpin icon */}
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 1.5L12.5 5.5L7.5 10.5L6.5 11.5L2.5 11.5L2.5 7.5L3.5 6.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 8.5L2 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
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

      {/* Site info row */}
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
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
          {/* Refresh - circular arrows */}
          <button
            onClick={onRefresh}
            className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11.5 7A4.5 4.5 0 1 1 7 2.5M11.5 7L9 4.5M11.5 7L9 9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Bookmark - flag */}
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors" title="Bookmark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 2V12L7 9L11 12V2H3Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Edit - pencil */}
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted hover:text-fg hover:bg-white/5 transition-colors" title="Edit">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L2.5 9.5L9.5 2.5L11.5 4.5L4.5 11.5L2 12Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 4L10 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
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
