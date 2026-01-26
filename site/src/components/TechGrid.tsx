import { motion } from 'framer-motion'

interface Tech {
  name: string
  category: string
  icon?: string
}

interface TechGridProps {
  tech: Tech[]
}

// Simple icon mapping - in production you'd use real icons
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
  openai: 'https://cdn.simpleicons.org/openai/412991',
  aws: 'https://cdn.simpleicons.org/amazonaws/FF9900',
  contentful: 'https://cdn.simpleicons.org/contentful/2478CC',
  sanity: 'https://cdn.simpleicons.org/sanity/F03E2F',
}

export function TechGrid({ tech }: TechGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {tech.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.03,
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex items-center gap-2 py-1.5 group cursor-default"
        >
          {/* Icon */}
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {item.icon && techIcons[item.icon] ? (
              <img
                src={techIcons[item.icon]}
                alt=""
                className="w-4 h-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`w-2 h-2 rounded-sm bg-muted/50 ${item.icon && techIcons[item.icon] ? 'hidden' : ''}`} />
          </div>

          {/* Name and category */}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate group-hover:text-accent transition-colors">
              {item.name}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted truncate">
              {item.category}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
