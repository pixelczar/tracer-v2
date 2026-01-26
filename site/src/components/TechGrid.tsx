import { useState } from 'react'
import { motion } from 'framer-motion'

const sexyEase = [0.16, 1, 0.3, 1] as const

interface Tech {
  name: string
  category: string
  icon?: string
  isSignal?: boolean
  url?: string
}

interface TechGridProps {
  tech: Tech[]
}

// Icon mapping using Simple Icons CDN
const techIcons: Record<string, string> = {
  react: 'https://cdn.simpleicons.org/react/61DAFB',
  nextjs: 'https://cdn.simpleicons.org/nextdotjs/FFFFFF',
  tailwind: 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
  typescript: 'https://cdn.simpleicons.org/typescript/3178C6',
  vercel: 'https://cdn.simpleicons.org/vercel/FFFFFF',
  cloudflare: 'https://cdn.simpleicons.org/cloudflare/F38020',
  stripe: 'https://cdn.simpleicons.org/stripe/635BFF',
  supabase: 'https://cdn.simpleicons.org/supabase/3FCF8E',
  sentry: 'https://cdn.simpleicons.org/sentry/362D59',
  segment: 'https://cdn.simpleicons.org/segment/52BD95',
  amplitude: 'https://cdn.simpleicons.org/amplitude/015ACC',
  intercom: 'https://cdn.simpleicons.org/intercom/6AFDEF',
  webgl: 'https://cdn.simpleicons.org/webgl/990000',
  threejs: 'https://cdn.simpleicons.org/threedotjs/FFFFFF',
  framer: 'https://cdn.simpleicons.org/framer/0055FF',
  gsap: 'https://cdn.simpleicons.org/greensock/88CE02',
  openai: 'https://cdn.simpleicons.org/openai/FFFFFF',
  aws: 'https://cdn.simpleicons.org/amazonaws/FF9900',
  contentful: 'https://cdn.simpleicons.org/contentful/2478CC',
  sanity: 'https://cdn.simpleicons.org/sanity/F03E2F',
  tiptap: 'https://cdn.simpleicons.org/tiptap/FFFFFF',
  launchdarkly: 'https://cdn.simpleicons.org/launchdarkly/FFFFFF',
  wasm: 'https://cdn.simpleicons.org/webassembly/654FF0',
  datadog: 'https://cdn.simpleicons.org/datadog/632CA6',
}

function TechItem({ tech }: { tech: Tech }) {
  const [iconError, setIconError] = useState(false)
  const iconUrl = tech.icon ? techIcons[tech.icon] : null

  return (
    <div className="flex items-start gap-2 py-1.5 min-w-0 group">
      {/* Icon - 12x12 like real Tracer */}
      <div className="flex-shrink-0 w-3 h-3 flex items-center justify-center mt-0.5">
        {iconUrl && !iconError ? (
          <img
            src={iconUrl}
            alt=""
            className="w-3 h-3 object-contain rounded-sm"
            loading="lazy"
            onError={() => setIconError(true)}
          />
        ) : (
          <div className="w-3 h-3 rounded-sm bg-muted/40" />
        )}
      </div>

      {/* Name + Category stacked */}
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-1 text-[13px] ${tech.isSignal ? 'font-semibold text-fg' : 'font-medium text-fg/90'}`}>
          <span className="truncate" title={tech.name}>{tech.name}</span>
          {tech.isSignal && (
            <span className="text-accent text-[8px] flex-shrink-0 -mt-2 opacity-30 group-hover:opacity-100 transition-opacity">✦</span>
          )}
        </div>
        <div className="text-[9px] font-mono text-muted uppercase tracking-wider">
          {tech.category}
        </div>
      </div>
    </div>
  )
}

export function TechGrid({ tech }: TechGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: {
            staggerChildren: 0.04,
            delayChildren: 0.2,
          },
        },
      }}
      className="grid grid-cols-2 gap-x-3"
    >
      {tech.map((item) => (
        <motion.div
          key={item.name}
          variants={{
            hidden: { opacity: 0, y: 6 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: sexyEase }}
        >
          <TechItem tech={item} />
        </motion.div>
      ))}
    </motion.div>
  )
}
