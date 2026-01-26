export interface SiteData {
  id: string
  name: string
  url: string
  favicon: string
  colors: string[]
  typography: {
    name: string
    weights: number[]
    preview: string
    fontFamily: string
  }[]
  tech: {
    name: string
    category: string
    icon?: string
  }[]
}

export const sites: SiteData[] = [
  {
    id: 'figma',
    name: 'figma.com',
    url: 'https://figma.com',
    favicon: 'https://static.figma.com/app/icon/1/favicon.svg',
    colors: ['#0D0D0D', '#FFFFFF', '#A259FF', '#1ABCFE', '#0ACF83', '#FF7262', '#F24E1E'],
    typography: [
      {
        name: 'Whyte Inktrap',
        weights: [400, 500],
        preview: 'Design without limits',
        fontFamily: "'DM Sans', sans-serif",
      },
      {
        name: 'Inter',
        weights: [400, 500, 600],
        preview: 'Build products faster',
        fontFamily: "'Inter', sans-serif",
      },
    ],
    tech: [
      { name: 'React', category: 'Framework', icon: 'react' },
      { name: 'Next.js', category: 'Meta Framework', icon: 'nextjs' },
      { name: 'WebGL', category: 'Graphics', icon: 'webgl' },
      { name: 'WebAssembly', category: 'Runtime', icon: 'wasm' },
      { name: 'Cloudflare', category: 'CDN', icon: 'cloudflare' },
      { name: 'Segment', category: 'Analytics', icon: 'segment' },
      { name: 'LaunchDarkly', category: 'Feature Flags', icon: 'launchdarkly' },
      { name: 'Sentry', category: 'Monitoring', icon: 'sentry' },
    ],
  },
  {
    id: 'claude',
    name: 'claude.ai',
    url: 'https://claude.ai',
    favicon: 'https://claude.ai/favicon.ico',
    colors: ['#CC785C', '#D4A27F', '#C6BEB5', '#1A1915', '#292521', '#F5F4EF', '#4A7CCC'],
    typography: [
      {
        name: 'Styrene A',
        weights: [400, 500],
        preview: 'Talk with Claude',
        fontFamily: "'Sora', sans-serif",
      },
      {
        name: 'Copernicus',
        weights: [400],
        preview: 'An AI assistant by Anthropic',
        fontFamily: "Georgia, serif",
      },
    ],
    tech: [
      { name: 'Next.js', category: 'Meta Framework', icon: 'nextjs' },
      { name: 'React', category: 'Framework', icon: 'react' },
      { name: 'Tailwind', category: 'Styling', icon: 'tailwind' },
      { name: 'Cloudflare', category: 'CDN', icon: 'cloudflare' },
      { name: 'Tiptap', category: 'Rich Text', icon: 'tiptap' },
      { name: 'Segment', category: 'Analytics', icon: 'segment' },
      { name: 'Intercom', category: 'Support', icon: 'intercom' },
      { name: 'Sentry', category: 'Monitoring', icon: 'sentry' },
    ],
  },
  {
    id: 'florafauna',
    name: 'florafauna.com',
    url: 'https://florafauna.ai',
    favicon: 'https://florafauna.com/favicon.ico',
    colors: ['#0F0F0F', '#FFFFFF', '#E8FF47', '#FF5C38', '#3D52FF', '#C4C4C4'],
    typography: [
      {
        name: 'GT America',
        weights: [400, 500, 700],
        preview: 'Digital craft studio',
        fontFamily: "'Space Grotesk', sans-serif",
      },
      {
        name: 'Neue Montreal',
        weights: [400, 500],
        preview: 'We make things move',
        fontFamily: "'Inter', sans-serif",
      },
    ],
    tech: [
      { name: 'Next.js', category: 'Meta Framework', icon: 'nextjs' },
      { name: 'React', category: 'Framework', icon: 'react' },
      { name: 'GSAP', category: 'Animation', icon: 'gsap' },
      { name: 'Three.js', category: '3D Graphics', icon: 'threejs' },
      { name: 'Framer Motion', category: 'Animation', icon: 'framer' },
      { name: 'Vercel', category: 'Hosting', icon: 'vercel' },
      { name: 'Sanity', category: 'CMS', icon: 'sanity' },
    ],
  },
  {
    id: 'ramp',
    name: 'ramp.com',
    url: 'https://ramp.com',
    favicon: 'https://ramp.com/favicon.ico',
    colors: ['#1C1917', '#FFFFFF', '#F9DC5C', '#0D9F6B', '#F5F5F4', '#78716C'],
    typography: [
      {
        name: 'Roobert',
        weights: [400, 500, 600],
        preview: 'The finance platform',
        fontFamily: "'DM Sans', sans-serif",
      },
      {
        name: 'Inter',
        weights: [400, 500],
        preview: 'Built for speed',
        fontFamily: "'Inter', sans-serif",
      },
    ],
    tech: [
      { name: 'React', category: 'Framework', icon: 'react' },
      { name: 'Next.js', category: 'Meta Framework', icon: 'nextjs' },
      { name: 'TypeScript', category: 'Language', icon: 'typescript' },
      { name: 'Contentful', category: 'CMS', icon: 'contentful' },
      { name: 'Segment', category: 'Analytics', icon: 'segment' },
      { name: 'Amplitude', category: 'Analytics', icon: 'amplitude' },
      { name: 'Datadog', category: 'Monitoring', icon: 'datadog' },
      { name: 'AWS', category: 'Cloud', icon: 'aws' },
    ],
  },
  {
    id: 'magicpatterns',
    name: 'magicpatterns.com',
    url: 'https://magicpatterns.com',
    favicon: 'https://magicpatterns.com/favicon.ico',
    colors: ['#09090B', '#FFFFFF', '#8B5CF6', '#A78BFA', '#22D3EE', '#374151'],
    typography: [
      {
        name: 'Cal Sans',
        weights: [600],
        preview: 'Design with AI',
        fontFamily: "'Space Grotesk', sans-serif",
      },
      {
        name: 'Inter',
        weights: [400, 500, 600],
        preview: 'Generate UI patterns',
        fontFamily: "'Inter', sans-serif",
      },
    ],
    tech: [
      { name: 'Next.js', category: 'Meta Framework', icon: 'nextjs' },
      { name: 'React', category: 'Framework', icon: 'react' },
      { name: 'Tailwind', category: 'Styling', icon: 'tailwind' },
      { name: 'OpenAI', category: 'AI', icon: 'openai' },
      { name: 'Vercel', category: 'Hosting', icon: 'vercel' },
      { name: 'Supabase', category: 'Database', icon: 'supabase' },
      { name: 'Stripe', category: 'Payments', icon: 'stripe' },
    ],
  },
]
