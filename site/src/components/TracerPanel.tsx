import { motion } from 'framer-motion'
import type { SiteData } from '../data/sites'
import { ColorSwatches } from './ColorSwatches'
import { TypographyPreview } from './TypographyPreview'
import { TechGrid } from './TechGrid'

interface TracerPanelProps {
  site: SiteData
}

export function TracerPanel({ site }: TracerPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-bg border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-accent font-mono text-sm font-medium">//</span>
          <span className="text-sm font-medium">Tracer</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded hover:bg-white/5 flex items-center justify-center cursor-pointer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-muted">
              <path d="M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="w-4 h-4 rounded hover:bg-white/5 flex items-center justify-center cursor-pointer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-muted">
              <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1"/>
            </svg>
          </div>
          <div className="w-4 h-4 rounded hover:bg-white/5 flex items-center justify-center cursor-pointer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-muted">
              <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Site info */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <img
          src={site.favicon}
          alt=""
          className="w-5 h-5 rounded"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span className="text-sm font-medium">{site.name}</span>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-muted hover:text-fg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 2.5H3.5C2.94772 2.5 2.5 2.94772 2.5 3.5V10.5C2.5 11.0523 2.94772 11.5 3.5 11.5H10.5C11.0523 11.5 11.5 11.0523 11.5 10.5V8.5" stroke="currentColor" strokeLinecap="round"/>
            <path d="M8.5 2.5H11.5V5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.5 2.5L6.5 7.5" stroke="currentColor" strokeLinecap="round"/>
          </svg>
        </a>
      </div>

      {/* Panel content */}
      <div className="p-4 space-y-6 max-h-[400px] overflow-y-auto">
        {/* Colors */}
        <section>
          <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted mb-3">
            Colors
          </h3>
          <ColorSwatches colors={site.colors} />
        </section>

        {/* Typography */}
        <section>
          <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted mb-3">
            Typography
          </h3>
          <TypographyPreview fonts={site.typography} />
        </section>

        {/* Tech */}
        <section>
          <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted mb-3">
            Tech <span className="text-fg/50 ml-1">{site.tech.length}</span>
          </h3>
          <TechGrid tech={site.tech} />
        </section>
      </div>
    </motion.div>
  )
}
