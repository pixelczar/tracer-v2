import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { sites } from './data/sites'
import { TracerPanel } from './components/TracerPanel'
import { SiteSelector } from './components/SiteSelector'
import { Logo } from './components/Logo'
import { BlinkingCursor } from './components/BlinkingCursor'

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/tracer/bngjllbgijacoakfcbcflhbedmdkegdo'
const AUTO_CYCLE_INTERVAL = 6000

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const activeSite = sites[activeIndex]

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const nextSite = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % sites.length)
    setProgress(0)
  }, [])

  // Auto-cycle through sites
  useEffect(() => {
    if (isPaused) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSite()
          return 0
        }
        return prev + (100 / (AUTO_CYCLE_INTERVAL / 50))
      })
    }, 50)

    return () => clearInterval(progressInterval)
  }, [isPaused, nextSite])

  const handleSiteSelect = (index: number) => {
    setActiveIndex(index)
    setProgress(0)
    setIsPaused(true)
    // Resume auto-cycle after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000)
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Hero */}
      <header className="pt-16 pb-8 px-6 md:pt-24 md:pb-12">
        <div className="max-w-6xl mx-auto">
          <Logo />
        </div>
      </header>

      {/* Demo */}
      <main className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Site Selector */}
            <SiteSelector
              sites={sites}
              activeIndex={activeIndex}
              progress={progress}
              onSelect={handleSiteSelect}
            />

            {/* Tracer Panel */}
            <AnimatePresence mode="wait">
              <TracerPanel
                key={`${activeSite.id}-${refreshKey}`}
                site={activeSite}
                onRefresh={handleRefresh}
              />
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* CTA */}
      <footer className="px-6 pb-20">
        <div className="max-w-6xl mx-auto flex flex-col items-start gap-4">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(234,255,0,0.25)] active:scale-100 transition-all duration-200"
          >
            <ChromeIcon />
            Add to Chrome
          </a>
          <span className="text-xs text-muted font-mono uppercase tracking-wider">
            Free on Chrome Web Store
          </span>
        </div>
      </footer>
    </div>
  )
}

function ChromeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  )
}

export default App
