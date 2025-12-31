import type { TechCategory } from './types';

export interface TechPattern {
    name: string;
    category: TechCategory;
    url: string;
    isSignal: boolean;
    patterns: {
        scripts?: RegExp[];
        globals?: string[];
        meta?: { name: string; content?: RegExp }[];
        headers?: { name: string; value?: RegExp }[];
        dom?: string[];
    };
}

export const TECH_PATTERNS: TechPattern[] = [
    // --- Frameworks & Libraries ---
    {
        name: 'React',
        category: 'js-framework',
        url: 'https://react.dev',
        isSignal: false,
        patterns: {
            globals: ['React', '__REACT_DEVTOOLS_GLOBAL_HOOK__', '_reactListening', '_reactRootContainer'],
            dom: ['[data-reactroot]', '[data-react-helmet]', '#react-root'],
            scripts: [/\/react(-dom)?(\.production|\.development)?\.js/],
        },
    },
    {
        name: 'Next.js',
        category: 'web-framework',
        url: 'https://nextjs.org',
        isSignal: false,
        patterns: {
            globals: ['__NEXT_DATA__', '__NEXT_P'],
            dom: ['#__next'],
            scripts: [/_next\/static/],
            meta: [{ name: 'next-head-count' }],
        },
    },
    {
        name: 'Vue.js',
        category: 'js-framework',
        url: 'https://vuejs.org',
        isSignal: false,
        patterns: {
            globals: ['Vue', '__VUE__'],
            dom: ['[data-v-]', '#app'], // #app is weak but common in Vue templates
        },
    },
    {
        name: 'Nuxt',
        category: 'web-framework',
        url: 'https://nuxt.com',
        isSignal: false,
        patterns: {
            globals: ['__NUXT__'],
            dom: ['#__nuxt'],
            scripts: [/_nuxt\//],
        },
    },
    {
        name: 'Svelte',
        category: 'js-framework',
        url: 'https://svelte.dev',
        isSignal: true,
        patterns: {
            globals: ['__svelte'],
            dom: ['[class*="svelte-"]'],
        },
    },
    {
        name: 'SvelteKit',
        category: 'web-framework',
        url: 'https://kit.svelte.dev',
        isSignal: true,
        patterns: {
            globals: ['__sveltekit'],
        },
    },
    {
        name: 'Remix',
        category: 'web-framework',
        url: 'https://remix.run',
        isSignal: true,
        patterns: {
            globals: ['__remixContext'],
        },
    },
    {
        name: 'Astro',
        category: 'web-framework',
        url: 'https://astro.build',
        isSignal: true,
        patterns: {
            dom: ['astro-island'],
        },
    },

    // --- Animation & Graphics ---
    {
        name: 'Three.js',
        category: 'webgl',
        url: 'https://threejs.org',
        isSignal: true,
        patterns: {
            globals: ['THREE'],
            scripts: [/three(\.min)?\.js/i],
        },
    },
    {
        name: 'GSAP',
        category: 'animation',
        url: 'https://gsap.com',
        isSignal: true,
        patterns: {
            globals: ['gsap', 'TweenMax', 'TweenLite'],
            scripts: [/gsap(\.min)?\.js/i],
        },
    },
    {
        name: 'Framer Motion',
        category: 'animation',
        url: 'https://www.framer.com/motion/',
        isSignal: true,
        patterns: {
            dom: ['[data-framer-appear-id]', '[data-framer-name]'],
        },
    },
    {
        name: 'Lottie',
        category: 'animation',
        url: 'https://lottiefiles.com',
        isSignal: true,
        patterns: {
            globals: ['lottie'],
            dom: ['lottie-player', 'dotlottie-player'],
            scripts: [/lottie/i],
        },
    },
    {
        name: 'Rive',
        category: 'animation',
        url: 'https://rive.app',
        isSignal: true,
        patterns: {
            globals: ['rive'],
            dom: ['canvas[data-rive]', 'rive-app'],
        },
    },
    {
        name: 'Spline',
        category: 'webgl',
        url: 'https://spline.design',
        isSignal: true,
        patterns: {
            dom: ['canvas[data-spline]'],
            scripts: [/spline/i]
        },
    },

    // --- UI Frameworks ---
    {
        name: 'Tailwind CSS',
        category: 'css-framework',
        url: 'https://tailwindcss.com',
        isSignal: false,
        patterns: {
            // Stronger heuristic: standard tailwind classes
            meta: [{ name: 'twitter:creator', content: /@tailwindcss/ }], // Rare but possible
            // Complex regex handled in extractors/tech.ts usually, but here are some specific DOM markers
        },
    },
    {
        name: 'Radix UI',
        category: 'ui-framework',
        url: 'https://radix-ui.com',
        isSignal: true,
        patterns: {
            dom: ['[data-radix-collection-item]', '[data-radix-popper-content-wrapper]', '[data-state]'], // data-state is generic but stronger when combined
        },
    },
    {
        name: 'Shadcn UI',
        category: 'ui-framework',
        url: 'https://ui.shadcn.com',
        isSignal: true,
        patterns: {
            // Often inferred from Radix + Tailwind + specific class patterns if we can detect them
            // Hard to detect directly without specific class names like "ring-offset-background" combined
        },
    },

    // --- Platforms & CMS ---
    {
        name: 'Vercel',
        category: 'paas',
        url: 'https://vercel.com',
        isSignal: false,
        patterns: {
            headers: [{ name: 'x-vercel-id' }, { name: 'server', value: /vercel/i }],
        },
    },
    {
        name: 'Cloudflare',
        category: 'cdn',
        url: 'https://cloudflare.com',
        isSignal: false,
        patterns: {
            headers: [{ name: 'cf-ray' }, { name: 'server', value: /cloudflare/i }],
        },
    },
    {
        name: 'WordPress',
        category: 'cms',
        url: 'https://wordpress.org',
        isSignal: false,
        patterns: {
            meta: [{ name: 'generator', content: /WordPress/i }],
            scripts: [/\/wp-content\//, /\/wp-includes\//],
            dom: ['#wpadminbar'],
        },
    },
    {
        name: 'Shopify',
        category: 'cms',
        url: 'https://shopify.com',
        isSignal: false,
        patterns: {
            globals: ['Shopify'],
            scripts: [/cdn\.shopify\.com/],
            dom: ['#shopify-section-header'],
        },
    },
    {
        name: 'Webflow',
        category: 'cms',
        url: 'https://webflow.com',
        isSignal: false,
        patterns: {
            globals: ['Webflow'],
            meta: [{ name: 'generator', content: /Webflow/i }],
            dom: ['.w-webflow-badge'],
        },
    },
    {
        name: 'Framer',
        category: 'cms',
        url: 'https://framer.com',
        isSignal: true,
        patterns: {
            scripts: [/framer\.com/, /events\.framer\.com/],
            dom: ['[data-framer-component-type]'],
        },
    },
    {
        name: 'Squarespace',
        category: 'cms',
        url: 'https://squarespace.com',
        isSignal: false,
        patterns: {
            globals: ['Squarespace'],
        },
    },

    // --- Analytics & Tools ---
    {
        name: 'Google Analytics',
        category: 'analytics',
        url: 'https://analytics.google.com',
        isSignal: false,
        patterns: {
            globals: ['ga', 'gtag'],
            scripts: [/googletagmanager\.com\/gtag/, /google-analytics\.com\/analytics\.js/],
        },
    },
    {
        name: 'Segment',
        category: 'customer-data',
        url: 'https://segment.com',
        isSignal: false,
        patterns: {
            globals: ['analytics'], // Weak global, usually needs check for .load method or similar
            scripts: [/cdn\.segment\.com/],
        },
    },
    {
        name: 'PostHog',
        category: 'analytics',
        url: 'https://posthog.com',
        isSignal: false,
        patterns: {
            globals: ['posthog'],
            scripts: [/app\.posthog\.com/],
        },
    },
];
