// Map tech names to their icon filenames
// Icons are from Wappalyzer: https://github.com/dochne/wappalyzer
const TECH_ICON_MAP: Record<string, string> = {
    // Frontend
    'React': 'React.svg',
    'Vue.js': 'Vue.js.svg',
    'Svelte': 'Svelte.svg',
    'Angular': 'Angular.svg',
    'AngularJS': 'Angular.svg',
    'Solid': 'Solid.svg',
    'Preact': 'Preact.svg',
    'Alpine.js': 'Alpine.js.svg',
    'Lit': 'Lit.svg',
    'HTMX': 'HTMX.svg',
    'Qwik': 'Qwik.svg',
    'Stimulus': 'Stimulus.svg',
    'Ember': 'Ember.svg',

    // Meta Frameworks
    'Next.js': 'Next.js.svg',
    'Nuxt': 'Nuxt.svg',
    'Remix': 'Remix.svg',
    'Astro': 'Astro.svg',
    'SvelteKit': 'SvelteKit.svg',
    'Gatsby': 'Gatsby.svg',
    'SolidStart': 'Solid.svg',

    // UI Frameworks
    'Material UI': 'Material UI.svg',
    'Chakra UI': 'Chakra UI.svg',
    'Ant Design': 'Ant Design.svg',
    'Vuetify': 'Vuetify.svg',
    'Mantine': 'Mantine.svg',
    'DaisyUI': 'DaisyUI.svg',
    'Radix UI': 'Radix.svg',
    'Shadcn UI': 'Shadcn.svg',
    'Headless UI': 'HeadlessUI.svg',
    'NextUI': 'NextUI.svg',
    'Blueprint': 'Blueprint.svg',
    'HeroUI': 'NextUI.svg',

    // JS Libraries
    'Redux': 'Redux.svg',
    'TanStack Query': 'TanStack.svg',
    'Zustand': 'Zustand.svg',
    'MobX': 'MobX.svg',
    'Lodash': 'Lodash.svg',
    'jQuery': 'jQuery.svg',
    'Axios': 'Axios.svg',
    'Moment.js': 'Moment.js.svg',
    'Day.js': 'Day.js.svg',
    'RxJS': 'RxJS.svg',
    'Turbo': 'Turbo.svg',
    'React Router': 'React Router.svg',
    'core-js': 'core-js.svg',
    'lit-html': 'Lit.svg',

    // Styling
    'Tailwind CSS': 'Tailwind CSS.svg',
    'Bootstrap': 'Bootstrap.svg',
    'Bulma': 'Bulma.svg',
    'styled-components': 'styled-components.svg',
    'Emotion': 'Emotion.svg',
    'Stitches': 'Stitches.svg',
    'Primer CSS': 'Primer.svg',
    'Vanilla Extract': 'Vite.svg',
    'Panda CSS': 'Vite.svg',

    // Font Services
    'Google Fonts': 'Google Fonts.svg',
    'Adobe Fonts': 'Adobe Fonts.svg',
    'Font Awesome': 'Font Awesome.svg',
    'Lucide': 'Lucide.svg',
    'Heroicons': 'Heroicons.svg',
    'Phosphor Icons': 'Phosphor.svg',
    'Material Icons': 'Material Icons.svg',

    // Graphics & Animation
    'GSAP': 'GSAP.svg',
    'Framer Motion': 'Framer Sites.svg', // Using Framer Sites icon as fallback
    'Anime.js': 'Anime.js.svg',
    'Lottie': 'Lottie.svg',
    'Rive': 'Rive.svg',
    'AOS': 'AOS.svg',
    'ScrollReveal': 'ScrollReveal.svg',
    'Locomotive Scroll': 'Locomotive.svg',
    'Lenis': 'Lenis.svg',
    'Barba.js': 'Barba.svg',
    'Swup': 'Swup.svg',
    'Theatre.js': 'Theatre.svg',

    // WebGL / 3D
    'Three.js': 'Three.js.svg',
    'React Three Fiber': 'React Three Fiber.svg',
    'Babylon.js': 'Babylon.js.svg',
    'PixiJS': 'PixiJS.svg',
    'A-Frame': 'A-Frame.svg',
    'Spline': 'Spline.svg',
    'Unicorn Studio': 'Unicorn.svg',
    'model-viewer': 'model-viewer.svg',

    // Canvas & Data Viz
    'Canvas API': 'Canvas.svg',
    'Fabric.js': 'Fabric.svg',
    'Konva': 'Konva.svg',
    'Paper.js': 'Paper.svg',
    'Paper': 'Paper.svg',
    'p5.js': 'p5.svg',
    'D3.js': 'D3.js.svg',
    'Chart.js': 'Chart.js.svg',
    'Recharts': 'Recharts.svg',
    'ECharts': 'ECharts.svg',
    'Highcharts': 'Highcharts.svg',
    'ApexCharts': 'ApexCharts.svg',
    'Plotly': 'Plotly.svg',
    'Observable': 'Observable.svg',

    // CMS
    'WordPress': 'WordPress.svg',
    'Contentful': 'Contentful.svg',
    'Sanity': 'Sanity.svg',
    'Strapi': 'Strapi.svg',
    'Storyblok': 'Storyblok.svg',
    'Prismic': 'Prismic.svg',
    'Ghost': 'Ghost.svg',
    'Payload': 'PayloadCMS.svg',
    // Note: Missing icons will use Tracer logo as placeholder in TechItem component

    // E-commerce
    'Shopify': 'Shopify.svg',
    'WooCommerce': 'WooCommerce.svg',
    'BigCommerce': 'BigCommerce.svg',
    'Medusa': 'Medusa.svg',
    'Snipcart': 'Snipcart.svg',

    // Site Builders
    'Webflow': 'Webflow.svg',
    'Framer': 'Framer.svg',
    'Squarespace': 'Squarespace.svg',
    'Wix': 'Wix.svg',
    'Carrd': 'Carrd.svg',
    'Bubble': 'Bubble.svg',

    // Documentation
    'Docusaurus': 'Docusaurus.svg',
    'Mintlify': 'Mintlify.svg',
    'GitBook': 'GitBook.svg',
    'VitePress': 'VitePress.svg',
    'Nextra': 'Nextra.svg',
    'Docsify': 'Docsify.svg',

    // Analytics
    'Google Analytics': 'Google Analytics.svg',
    'Plausible': 'Plausible.svg',
    'Fathom': 'Fathom.svg',
    'PostHog': 'PostHog.svg',
    'Amplitude': 'Amplitude.svg',
    'Mixpanel': 'Mixpanel.svg',
    'Heap': 'Heap.svg',
    'FullStory': 'FullStory.svg',
    'Hotjar': 'Hotjar.svg',
    'LogRocket': 'LogRocket.svg',
    'Datadog': 'Datadog.svg',
    'Clarity': 'Microsoft Clarity.svg',
    'LinkedIn Insight Tag': 'LinkedIn.svg',
    'Microsoft Power BI': 'Microsoft Clarity.svg',
    'Quora Pixel': 'Quora.svg',

    // A/B Testing
    'Optimizely': 'Optimizely.svg',
    'LaunchDarkly': 'LaunchDarkly.svg',
    'Statsig': 'Statsig.svg',
    'GrowthBook': 'GrowthBook.svg',

    // CDP & Tag Manager
    'Segment': 'Segment.svg',
    'RudderStack': 'RudderStack.svg',
    'Google Tag Manager': 'Google Tag Manager.svg',
    'Tealium': 'Tealium.svg',

    // Live Chat
    'Intercom': 'Intercom.svg',
    'Zendesk': 'Zendesk.svg',
    'Drift': 'Drift.svg',
    'Crisp': 'Crisp.svg',
    'Tawk.to': 'Tawk.to.svg',
    'HubSpot': 'HubSpot.svg',

    // Payments
    'Stripe': 'Stripe.svg',
    'PayPal': 'PayPal.svg',
    'Paddle': 'Paddle.svg',
    'LemonSqueezy': 'LemonSqueezy.svg',
    'Gumroad': 'Gumroad.svg',

    // Infrastructure
    'Vercel': 'Vercel.svg',
    'Netlify': 'Netlify.svg',
    'Cloudflare Pages': 'Cloudflare.svg',
    'GitHub Pages': 'GitHub Pages.svg',
    'Render': 'Render.svg',
    'Railway': 'Railway.svg',
    'Fly.io': 'Fly.io.svg',
    'Cloudflare': 'Cloudflare.svg',
    'Fastly': 'Fastly.svg',
    'Amazon Web Services': 'Amazon Web Services.svg',
    'Amazon CloudFront': 'Amazon CloudFront.svg',
    'Amazon S3': 'Amazon S3.svg',
    'Nginx': 'Nginx.svg',
    'Google Cloud Platform': 'Google Cloud Platform.svg',
    'Google Cloud CDN': 'Google Cloud Platform.svg',

    // Backend Services
    'Firebase': 'Firebase.svg',
    'Supabase': 'Supabase.svg',
    'Appwrite': 'Appwrite.svg',
    'PocketBase': 'PocketBase.svg',
    'Convex': 'Convex.svg',

    // Image CDN
    'Cloudinary': 'Cloudinary.svg',
    'Imgix': 'Imgix.svg',
    'ImageKit': 'ImageKit.svg',

    // Video
    'YouTube': 'YouTube.svg',
    'Vimeo': 'Vimeo.svg',
    'Wistia': 'Wistia.svg',
    'Mux': 'Mux.svg',
    'VideoJS': 'VideoJS.svg',

    // Error Tracking
    'Sentry': 'Sentry.svg',
    'Bugsnag': 'Bugsnag.svg',
    'Rollbar': 'Rollbar.svg',
    'Highlight': 'Highlight.svg',
    'New Relic': 'New Relic.svg',
    'Cloudflare Browser Insights': 'Cloudflare.svg',
    'Asana': 'Asana.svg',

    // Security
    'HSTS': 'HSTS.svg',
    'reCAPTCHA': 'reCAPTCHA.svg',
    'hCaptcha': 'hCaptcha.svg',
    'Turnstile': 'Turnstile.svg',
    'PerimeterX': 'PerimeterX.svg',
    'Cloudflare Bot Management': 'Cloudflare.svg',

    // Auth
    'Clerk': 'Clerk.svg',
    'Auth0': 'Auth0.svg',
    'NextAuth.js': 'NextAuth.svg',
    'Supabase Auth': 'Supabase.svg',
    'Google Sign-in': 'Google.svg',

    // Consent
    'OneTrust': 'OneTrust.svg',
    'Cookiebot': 'Cookiebot.svg',
    'iubenda': 'iubenda.svg',

    // Build Tools
    'Webpack': 'Webpack.svg',
    'Vite': 'Vite.svg',
    'Parcel': 'Parcel.svg',
    'TypeScript': 'TypeScript.svg',
    'Babel': 'Babel.svg',
    'Play': 'Vite.svg',
    'Scala': 'Vite.svg',
    'Java': 'Vite.svg',
    'WebSocket': 'Socket.io.svg',

    // Maps
    'Google Maps': 'Google Maps.svg',
    'Mapbox': 'Mapbox.svg',
    'Leaflet': 'Leaflet.svg',

    // Forms
    'Typeform': 'Typeform.svg',
    'Tally': 'Tally.svg',

    // Rich Text
    'TipTap': 'TipTap.svg',
    'Quill': 'Quill.svg',
    'CKEditor': 'CKEditor.svg',

    // Code Display
    'Prism': 'Prism.svg',
    'Highlight.js': 'Highlight.js.svg',
    'Monaco Editor': 'Monaco.svg',
    'CodeMirror': 'CodeMirror.svg',

    // PWA
    'PWA': 'PWA.svg',

    // Search
    'Algolia': 'Algolia.svg',
    'Typesense': 'Typesense.svg',
    'MeiliSearch': 'MeiliSearch.svg',

    // Realtime
    'Socket.io': 'Socket.io.svg',
    'Pusher': 'Pusher.svg',
    'Ably': 'Ably.svg',
    'Liveblocks': 'Liveblocks.svg',
    'PartyKit': 'PartyKit.svg',

    // i18n
    'Weglot': 'Weglot.svg',

    // Feedback
    'Canny': 'Canny.svg',
    'Userpilot': 'Userpilot.svg',

    // Scheduling
    'Calendly': 'Calendly.svg',
    'Cal.com': 'Cal.svg',

    // Accessibility
    'accessiBe': 'accessiBe.svg',
    'UserWay': 'UserWay.svg',

    // Social
    'Twitter/X': 'Twitter.svg',
    'Facebook SDK': 'Facebook.svg',

    // SEO
    'Open Graph': 'Open Graph.svg',

    // Advertising
    'Google Ads': 'Google Ads.svg',
    'Google Ads Conversion Tracking': 'Google Ads.svg',
    'DoubleClick': 'DoubleClick.svg',
    'DoubleClick Floodlight': 'DoubleClick.svg',
    'Microsoft Advertising': 'Microsoft.svg',

    // Cloud Services
    'Azure Edge Network': 'Azure.svg',
    'Microsoft Azure': 'Azure.svg',

    // AI
    'OpenAI': 'OpenAI.svg',
    'Vercel AI': 'Vercel.svg',

    // Performance
    'web-vitals': 'web-vitals.svg',
    'Priority Hints': 'Priority.svg',
    'HTTP/3': 'HTTP3.svg',

    // AI Generated
    'v0': 'v0.svg',
    'Vercel v0': 'Vercel.svg',
    'Lovable': 'Lovable.svg',
    'Bolt': 'Bolt.svg',
    'Replit': 'Replit.svg',
    'StackBlitz': 'StackBlitz.svg',
    'CodeSandbox': 'CodeSandbox.svg',
    'Glitch': 'Glitch.svg',
    'Create React App': 'React.svg',
    'Cursor': 'Cursor.svg',
    'Windsurf': 'Windsurf.svg',
    'Devin': 'Devin.svg',
    'GPT Engineer': 'GPT.svg',
    'Builder.io': 'Builder.io.svg',
    'Tilda': 'Tilda.svg',
};

export function getTechIcon(techName: string): string | undefined {
    const filename = TECH_ICON_MAP[techName];
    if (filename) {
        return new URL(`../assets/tech-icons/${filename}`, import.meta.url).href;
    }
    return undefined;
}

