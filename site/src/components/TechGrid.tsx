import { motion } from 'framer-motion'

interface Tech {
  name: string
  category: string
  icon?: string
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

export function TechGrid({ tech }: TechGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0">
      {tech.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.025,
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex items-start gap-2 py-2 group cursor-default hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
        >
          {/* Icon */}
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
            {item.icon && techIcons[item.icon] ? (
              <img
                src={techIcons[item.icon]}
                alt=""
                className="w-4 h-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) fallback.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`w-2.5 h-2.5 rounded-sm bg-muted/40 ${item.icon && techIcons[item.icon] ? 'hidden' : ''}`} />
          </div>

          {/* Name and category */}
          <div className="min-w-0 flex-1">
            <div className="text-sm text-fg truncate group-hover:text-accent transition-colors">
              {item.name}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted/70 truncate">
              {item.category}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
