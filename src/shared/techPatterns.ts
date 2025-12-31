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
    versionGlobal?: string;
    versionDom?: { selector: string; attribute?: string; regex?: RegExp };
    implies?: string[];
}

export const TECH_PATTERNS: TechPattern[] = [
    // ==================== FRONTEND ====================
    // JS Frameworks
    { name: 'React', category: 'js-framework', url: 'https://react.dev', isSignal: false, patterns: { globals: ['React', '__REACT_DEVTOOLS_GLOBAL_HOOK__', '_reactListening'], dom: ['[data-reactroot]', '[data-react-helmet]', '#react-root'] }, versionGlobal: 'React.version' },
    { name: 'Vue.js', category: 'js-framework', url: 'https://vuejs.org', isSignal: false, patterns: { globals: ['Vue', '__VUE__', '__VUE_DEVTOOLS_GLOBAL_HOOK__'], dom: ['[data-v-]'] }, versionGlobal: 'Vue.version' },
    { name: 'Svelte', category: 'js-framework', url: 'https://svelte.dev', isSignal: true, patterns: { globals: ['__svelte'], dom: ['[class*="svelte-"]'] } },
    { name: 'Angular', category: 'js-framework', url: 'https://angular.io', isSignal: false, patterns: { globals: ['ng'], dom: ['[ng-version]', '[_ngcontent-]'] } },
    { name: 'Solid', category: 'js-framework', url: 'https://solidjs.com', isSignal: true, patterns: { globals: ['_$HY', 'Solid'] } },
    { name: 'Preact', category: 'js-framework', url: 'https://preactjs.com', isSignal: false, patterns: { globals: ['preact', '__PREACT_DEVTOOLS__'] } },
    { name: 'Alpine.js', category: 'js-framework', url: 'https://alpinejs.dev', isSignal: true, patterns: { globals: ['Alpine'], dom: ['[x-data]', '[x-init]'] } },
    { name: 'Lit', category: 'js-framework', url: 'https://lit.dev', isSignal: true, patterns: { globals: ['lit', 'litHtml'] } },
    { name: 'HTMX', category: 'js-framework', url: 'https://htmx.org', isSignal: true, patterns: { globals: ['htmx'], dom: ['[hx-get]', '[hx-post]', '[hx-trigger]'] } },
    { name: 'Qwik', category: 'js-framework', url: 'https://qwik.builder.io', isSignal: true, patterns: { globals: ['qwik'], dom: ['[q\\:container]'] } },
    { name: 'Stimulus', category: 'js-framework', url: 'https://stimulus.hotwired.dev', isSignal: true, patterns: { globals: ['Stimulus'], dom: ['[data-controller]'] } },
    { name: 'Ember', category: 'js-framework', url: 'https://emberjs.com', isSignal: false, patterns: { globals: ['Ember', 'Em'] } },

    // Meta Frameworks
    { name: 'Next.js', category: 'web-framework', url: 'https://nextjs.org', isSignal: false, patterns: { globals: ['__NEXT_DATA__', '__NEXT_P'], dom: ['#__next'], scripts: [/_next\//] } },
    { name: 'Nuxt', category: 'web-framework', url: 'https://nuxt.com', isSignal: false, patterns: { globals: ['__NUXT__'], dom: ['#__nuxt'], scripts: [/_nuxt\//] } },
    { name: 'Remix', category: 'web-framework', url: 'https://remix.run', isSignal: true, patterns: { globals: ['__remixContext'] } },
    { name: 'React Router', category: 'js-library', url: 'https://reactrouter.com', isSignal: false, patterns: { globals: ['__reactRouterContext', 'ReactRouter'] } },
    { name: 'Astro', category: 'web-framework', url: 'https://astro.build', isSignal: true, patterns: { dom: ['astro-island', 'astro-slot', 'style[data-astro-dev-id]'], meta: [{ name: 'generator', content: /Astro/i }] } },
    { name: 'SvelteKit', category: 'web-framework', url: 'https://kit.svelte.dev', isSignal: true, patterns: { globals: ['__sveltekit'] } },
    { name: 'Gatsby', category: 'web-framework', url: 'https://gatsbyjs.com', isSignal: false, patterns: { globals: ['___gatsby'], dom: ['#___gatsby', 'style#gatsby-inlined-css'] }, versionGlobal: '___gatsby.version' },
    { name: 'SolidStart', category: 'web-framework', url: 'https://start.solidjs.com', isSignal: true, patterns: { globals: ['_$HY'], scripts: [/solid-start/] } },

    // UI Frameworks
    { name: 'Radix UI', category: 'ui-framework', url: 'https://radix-ui.com', isSignal: true, patterns: { dom: ['[data-radix-collection-item]', '[data-radix-popper-content-wrapper]'] } },
    { name: 'Shadcn UI', category: 'ui-framework', url: 'https://ui.shadcn.com', isSignal: true, patterns: {} },
    { name: 'Material UI', category: 'ui-framework', url: 'https://mui.com', isSignal: false, patterns: { globals: ['MaterialUI'], dom: ['[class*="Mui"]'] } },
    { name: 'Chakra UI', category: 'ui-framework', url: 'https://chakra-ui.com', isSignal: true, patterns: { dom: ['[class*="chakra-"]'] } },
    { name: 'Headless UI', category: 'ui-framework', url: 'https://headlessui.com', isSignal: true, patterns: { dom: ['[data-headlessui-state]'] } },
    { name: 'Mantine', category: 'ui-framework', url: 'https://mantine.dev', isSignal: true, patterns: { dom: ['[class*="mantine-"]'] } },
    { name: 'Ant Design', category: 'ui-framework', url: 'https://ant.design', isSignal: false, patterns: { dom: ['[class*="ant-"]'] } },
    { name: 'NextUI', category: 'ui-framework', url: 'https://nextui.org', isSignal: true, patterns: { dom: ['[class*="nextui-"]'] } },
    { name: 'DaisyUI', category: 'ui-framework', url: 'https://daisyui.com', isSignal: true, patterns: { dom: ['[data-theme]', '.btn-primary.btn-sm', '.card.bg-base-200'] } },
    { name: 'Blueprint', category: 'ui-framework', url: 'https://blueprintjs.com', isSignal: false, patterns: { dom: ['[class*="bp4-"]', '[class*="bp5-"]'] } },
    { name: 'Vuetify', category: 'ui-framework', url: 'https://vuetifyjs.com', isSignal: false, patterns: { dom: ['.v-application', '.v-main'] } },

    // JS Libraries
    { name: 'Redux', category: 'js-library', url: 'https://redux.js.org', isSignal: false, patterns: { globals: ['__REDUX_DEVTOOLS_EXTENSION__'] } },
    { name: 'TanStack Query', category: 'js-library', url: 'https://tanstack.com/query', isSignal: false, patterns: { globals: ['__REACT_QUERY_STATE__'] } },
    { name: 'Zustand', category: 'js-library', url: 'https://zustand-demo.pmnd.rs', isSignal: true, patterns: { globals: ['zustand'] } },
    { name: 'MobX', category: 'js-library', url: 'https://mobx.js.org', isSignal: false, patterns: { globals: ['mobx'] } },
    { name: 'Lodash', category: 'js-library', url: 'https://lodash.com', isSignal: false, patterns: { globals: ['_'] } },
    { name: 'jQuery', category: 'js-library', url: 'https://jquery.com', isSignal: false, patterns: { globals: ['jQuery', '$'] } },
    { name: 'Axios', category: 'js-library', url: 'https://axios-http.com', isSignal: false, patterns: { globals: ['axios'] } },
    { name: 'Moment.js', category: 'js-library', url: 'https://momentjs.com', isSignal: false, patterns: { globals: ['moment'] } },
    { name: 'Day.js', category: 'js-library', url: 'https://day.js.org', isSignal: false, patterns: { globals: ['dayjs'] } },
    { name: 'RxJS', category: 'js-library', url: 'https://rxjs.dev', isSignal: false, patterns: { globals: ['rxjs'] } },
    { name: 'Turbo', category: 'js-library', url: 'https://turbo.hotwired.dev', isSignal: true, patterns: { globals: ['Turbo'], dom: ['[data-turbo]', '[data-turbo-frame]'] } },
    { name: 'lit-html', category: 'js-library', url: 'https://lit.dev', isSignal: false, patterns: { globals: ['__lit-html', 'litHtml'] } },

    // ==================== STYLING ====================
    { name: 'Tailwind CSS', category: 'css-framework', url: 'https://tailwindcss.com', isSignal: false, patterns: { dom: ['html.tw-dark', '[class*="tw-"]'], globals: ['tailwind'] } },
    { name: 'Bootstrap', category: 'css-framework', url: 'https://getbootstrap.com', isSignal: false, patterns: { globals: ['bootstrap'], dom: ['.container-fluid', '.row', '.col-md-'] } },
    { name: 'Bulma', category: 'css-framework', url: 'https://bulma.io', isSignal: false, patterns: { dom: ['.is-primary.button', '.columns'] } },
    { name: 'styled-components', category: 'css-in-js', url: 'https://styled-components.com', isSignal: false, patterns: { dom: ['style[data-styled]', '[class*="sc-"]'] } },
    { name: 'Emotion', category: 'css-in-js', url: 'https://emotion.sh', isSignal: false, patterns: { dom: ['style[data-emotion]'] } },
    { name: 'Stitches', category: 'css-in-js', url: 'https://stitches.dev', isSignal: true, patterns: { dom: ['style[data-stitches]'] } },
    { name: 'Vanilla Extract', category: 'css-in-js', url: 'https://vanilla-extract.style', isSignal: true, patterns: {} },
    { name: 'Panda CSS', category: 'css-in-js', url: 'https://panda-css.com', isSignal: true, patterns: {} },
    { name: 'Primer CSS', category: 'css-framework', url: 'https://primer.style', isSignal: true, patterns: { dom: ['[class*="Box-row"]', '[class*="btn-octicon"]', '.primer-light', '.primer-dark'] } },

    // Font Services
    { name: 'Google Fonts', category: 'font-service', url: 'https://fonts.google.com', isSignal: false, patterns: { scripts: [/fonts\.googleapis\.com/, /fonts\.gstatic\.com/] } },
    { name: 'Adobe Fonts', category: 'font-service', url: 'https://fonts.adobe.com', isSignal: false, patterns: { scripts: [/use\.typekit\.net/] } },
    { name: 'Font Awesome', category: 'font-service', url: 'https://fontawesome.com', isSignal: false, patterns: { dom: ['.fa', '.fas', '.fab', '.far'], scripts: [/fontawesome/i] } },
    { name: 'Lucide', category: 'font-service', url: 'https://lucide.dev', isSignal: true, patterns: { dom: ['svg.lucide', '[data-lucide]'] } },
    { name: 'Heroicons', category: 'font-service', url: 'https://heroicons.com', isSignal: true, patterns: { dom: ['svg[class*="heroicon"]'] } },
    { name: 'Phosphor Icons', category: 'font-service', url: 'https://phosphoricons.com', isSignal: true, patterns: { dom: ['[class*="ph-"]'] } },
    { name: 'Material Icons', category: 'font-service', url: 'https://fonts.google.com/icons', isSignal: false, patterns: { dom: ['.material-icons', '.material-symbols-outlined'] } },

    // ==================== GRAPHICS & ANIMATION ====================
    { name: 'GSAP', category: 'animation', url: 'https://gsap.com', isSignal: true, patterns: { globals: ['gsap', 'TweenMax', 'TweenLite'] } },
    { name: 'Framer Motion', category: 'animation', url: 'https://www.framer.com/motion/', isSignal: true, patterns: { dom: ['[data-framer-appear-id]'] } },
    { name: 'Anime.js', category: 'animation', url: 'https://animejs.com', isSignal: true, patterns: { globals: ['anime'] } },
    { name: 'Lottie', category: 'animation', url: 'https://lottiefiles.com', isSignal: true, patterns: { globals: ['lottie'], dom: ['lottie-player', 'dotlottie-player'] } },
    { name: 'Rive', category: 'animation', url: 'https://rive.app', isSignal: true, patterns: { globals: ['rive'], dom: ['canvas[data-rive]'] } },
    { name: 'AOS', category: 'animation', url: 'https://michalsnik.github.io/aos/', isSignal: false, patterns: { globals: ['AOS'], dom: ['[data-aos]'] } },
    { name: 'ScrollReveal', category: 'animation', url: 'https://scrollrevealjs.org', isSignal: false, patterns: { globals: ['ScrollReveal'] } },
    { name: 'Locomotive Scroll', category: 'animation', url: 'https://locomotivemtl.github.io/locomotive-scroll/', isSignal: true, patterns: { dom: ['[data-scroll]', '[data-scroll-container]'] } },
    { name: 'Lenis', category: 'animation', url: 'https://lenis.studiofreight.com', isSignal: true, patterns: { globals: ['Lenis'] } },
    { name: 'Barba.js', category: 'animation', url: 'https://barba.js.org', isSignal: true, patterns: { globals: ['barba'], dom: ['[data-barba]'] } },
    { name: 'Swup', category: 'animation', url: 'https://swup.js.org', isSignal: true, patterns: { globals: ['swup'] } },

    // WebGL / 3D
    { name: 'Three.js', category: 'webgl', url: 'https://threejs.org', isSignal: true, patterns: { globals: ['THREE'] } },
    { name: 'React Three Fiber', category: 'webgl', url: 'https://docs.pmnd.rs/react-three-fiber', isSignal: true, patterns: {} },
    { name: 'Babylon.js', category: 'webgl', url: 'https://babylonjs.com', isSignal: true, patterns: { globals: ['BABYLON'] } },
    { name: 'PixiJS', category: 'webgl', url: 'https://pixijs.com', isSignal: true, patterns: { globals: ['PIXI'] } },
    { name: 'A-Frame', category: 'webgl', url: 'https://aframe.io', isSignal: true, patterns: { dom: ['a-scene', 'a-entity'] } },
    { name: 'Spline', category: 'webgl', url: 'https://spline.design', isSignal: true, patterns: { scripts: [/spline/i] } },
    { name: 'model-viewer', category: 'webgl', url: 'https://modelviewer.dev', isSignal: true, patterns: { dom: ['model-viewer'] } },

    // Canvas & SVG
    { name: 'Fabric.js', category: 'canvas', url: 'http://fabricjs.com', isSignal: true, patterns: { globals: ['fabric'] } },
    { name: 'Konva', category: 'canvas', url: 'https://konvajs.org', isSignal: true, patterns: { globals: ['Konva'] } },
    { name: 'Paper.js', category: 'canvas', url: 'http://paperjs.org', isSignal: true, patterns: { globals: ['paper'] } },
    { name: 'p5.js', category: 'canvas', url: 'https://p5js.org', isSignal: true, patterns: { globals: ['p5'] } },

    // Data Visualization
    { name: 'D3.js', category: 'dataviz', url: 'https://d3js.org', isSignal: true, patterns: { globals: ['d3'] } },
    { name: 'Chart.js', category: 'dataviz', url: 'https://chartjs.org', isSignal: false, patterns: { globals: ['Chart'] } },
    { name: 'Recharts', category: 'dataviz', url: 'https://recharts.org', isSignal: true, patterns: { dom: ['.recharts-wrapper'] } },
    { name: 'ECharts', category: 'dataviz', url: 'https://echarts.apache.org', isSignal: false, patterns: { globals: ['echarts'] } },
    { name: 'Highcharts', category: 'dataviz', url: 'https://highcharts.com', isSignal: false, patterns: { globals: ['Highcharts'] } },
    { name: 'ApexCharts', category: 'dataviz', url: 'https://apexcharts.com', isSignal: false, patterns: { globals: ['ApexCharts'] } },
    { name: 'Plotly', category: 'dataviz', url: 'https://plotly.com', isSignal: false, patterns: { globals: ['Plotly'] } },

    // ==================== CONTENT & CMS ====================
    { name: 'WordPress', category: 'cms', url: 'https://wordpress.org', isSignal: false, patterns: { meta: [{ name: 'generator', content: /WordPress/i }], scripts: [/\/wp-content\//, /\/wp-includes\//] } },
    { name: 'Contentful', category: 'cms', url: 'https://contentful.com', isSignal: false, patterns: { scripts: [/contentful/] } },
    { name: 'Sanity', category: 'cms', url: 'https://sanity.io', isSignal: true, patterns: { scripts: [/sanity\.io/] } },
    { name: 'Strapi', category: 'cms', url: 'https://strapi.io', isSignal: true, patterns: { globals: ['strapi'], meta: [{ name: 'generator', content: /Strapi/i }] } },
    { name: 'Prismic', category: 'cms', url: 'https://prismic.io', isSignal: false, patterns: { scripts: [/prismic\.io/] } },
    { name: 'Ghost', category: 'cms', url: 'https://ghost.org', isSignal: false, patterns: { meta: [{ name: 'generator', content: /Ghost/i }] } },

    // E-commerce
    { name: 'Shopify', category: 'ecommerce', url: 'https://shopify.com', isSignal: false, patterns: { globals: ['Shopify'], scripts: [/cdn\.shopify\.com/] } },
    { name: 'WooCommerce', category: 'ecommerce', url: 'https://woocommerce.com', isSignal: false, patterns: { dom: ['.woocommerce', '[class*="wc-"]'] } },
    { name: 'BigCommerce', category: 'ecommerce', url: 'https://bigcommerce.com', isSignal: false, patterns: { scripts: [/bigcommerce/] } },
    { name: 'Medusa', category: 'ecommerce', url: 'https://medusajs.com', isSignal: true, patterns: {} },
    { name: 'Snipcart', category: 'ecommerce', url: 'https://snipcart.com', isSignal: true, patterns: { scripts: [/snipcart/] } },

    // Site Builders
    { name: 'Webflow', category: 'site-builder', url: 'https://webflow.com', isSignal: false, patterns: { globals: ['Webflow'], meta: [{ name: 'generator', content: /Webflow/i }] } },
    { name: 'Framer', category: 'site-builder', url: 'https://framer.com', isSignal: true, patterns: { scripts: [/framer\.com/], dom: ['[data-framer-component-type]'] } },
    { name: 'Squarespace', category: 'site-builder', url: 'https://squarespace.com', isSignal: false, patterns: { globals: ['Squarespace'], scripts: [/squarespace/] } },
    { name: 'Wix', category: 'site-builder', url: 'https://wix.com', isSignal: false, patterns: { scripts: [/wix\.com/, /wixstatic\.com/] } },
    { name: 'Carrd', category: 'site-builder', url: 'https://carrd.co', isSignal: true, patterns: { scripts: [/carrd\.co/] } },
    { name: 'Bubble', category: 'site-builder', url: 'https://bubble.io', isSignal: false, patterns: { scripts: [/bubble\.io/] } },

    // Documentation
    { name: 'Docusaurus', category: 'documentation', url: 'https://docusaurus.io', isSignal: true, patterns: { meta: [{ name: 'generator', content: /Docusaurus/i }] } },
    { name: 'Mintlify', category: 'documentation', url: 'https://mintlify.com', isSignal: true, patterns: { scripts: [/mintlify/] } },
    { name: 'GitBook', category: 'documentation', url: 'https://gitbook.com', isSignal: false, patterns: { scripts: [/gitbook/] } },
    { name: 'VitePress', category: 'documentation', url: 'https://vitepress.dev', isSignal: true, patterns: { dom: ['.VPDoc', '.VPNavBar'] } },
    { name: 'Nextra', category: 'documentation', url: 'https://nextra.site', isSignal: true, patterns: {} },
    { name: 'Docsify', category: 'documentation', url: 'https://docsify.js.org', isSignal: false, patterns: { globals: ['$docsify'] } },

    // ==================== ANALYTICS & MARKETING ====================
    { name: 'Google Analytics', category: 'analytics', url: 'https://analytics.google.com', isSignal: false, patterns: { globals: ['ga', 'gtag'], scripts: [/google-analytics\.com/, /googletagmanager\.com/] } },
    { name: 'Plausible', category: 'analytics', url: 'https://plausible.io', isSignal: true, patterns: { scripts: [/plausible\.io/] } },
    { name: 'Fathom', category: 'analytics', url: 'https://usefathom.com', isSignal: true, patterns: { scripts: [/usefathom\.com/] } },
    { name: 'PostHog', category: 'analytics', url: 'https://posthog.com', isSignal: true, patterns: { globals: ['posthog'], scripts: [/posthog\.com/] } },
    { name: 'Amplitude', category: 'analytics', url: 'https://amplitude.com', isSignal: false, patterns: { globals: ['amplitude'], scripts: [/amplitude\.com/] } },
    { name: 'Mixpanel', category: 'analytics', url: 'https://mixpanel.com', isSignal: false, patterns: { globals: ['mixpanel'], scripts: [/mixpanel\.com/] } },
    { name: 'Heap', category: 'analytics', url: 'https://heap.io', isSignal: false, patterns: { globals: ['heap'], scripts: [/heap\.io/] } },
    { name: 'FullStory', category: 'heatmaps', url: 'https://fullstory.com', isSignal: false, patterns: { globals: ['FS'], scripts: [/fullstory\.com/] } },
    { name: 'Hotjar', category: 'heatmaps', url: 'https://hotjar.com', isSignal: false, patterns: { globals: ['hj', '_hjSettings'], scripts: [/hotjar\.com/] } },
    { name: 'LogRocket', category: 'heatmaps', url: 'https://logrocket.com', isSignal: false, patterns: { globals: ['LogRocket'], scripts: [/logrocket/] } },
    { name: 'Clarity', category: 'heatmaps', url: 'https://clarity.microsoft.com', isSignal: false, patterns: { scripts: [/clarity\.ms/] } },

    // A/B Testing
    { name: 'Optimizely', category: 'ab-testing', url: 'https://optimizely.com', isSignal: false, patterns: { globals: ['optimizely'], scripts: [/optimizely/] } },
    { name: 'LaunchDarkly', category: 'ab-testing', url: 'https://launchdarkly.com', isSignal: true, patterns: { scripts: [/launchdarkly/] } },
    { name: 'Statsig', category: 'ab-testing', url: 'https://statsig.com', isSignal: true, patterns: { scripts: [/statsig/] } },
    { name: 'GrowthBook', category: 'ab-testing', url: 'https://growthbook.io', isSignal: true, patterns: { globals: ['growthbook'] } },

    // CDP & Tag Management
    { name: 'Segment', category: 'customer-data', url: 'https://segment.com', isSignal: false, patterns: { globals: ['analytics'], scripts: [/segment\.com/] } },
    { name: 'RudderStack', category: 'customer-data', url: 'https://rudderstack.com', isSignal: true, patterns: { scripts: [/rudderstack/] } },
    { name: 'Google Tag Manager', category: 'tag-manager', url: 'https://tagmanager.google.com', isSignal: false, patterns: { scripts: [/googletagmanager\.com\/gtm/] } },

    // Live Chat
    { name: 'Intercom', category: 'live-chat', url: 'https://intercom.com', isSignal: false, patterns: { globals: ['Intercom'], scripts: [/intercom/] } },
    { name: 'Zendesk', category: 'live-chat', url: 'https://zendesk.com', isSignal: false, patterns: { scripts: [/zendesk/, /zdassets/] } },
    { name: 'Drift', category: 'live-chat', url: 'https://drift.com', isSignal: false, patterns: { globals: ['drift'], scripts: [/drift\.com/] } },
    { name: 'Crisp', category: 'live-chat', url: 'https://crisp.chat', isSignal: false, patterns: { globals: ['$crisp'], scripts: [/crisp\.chat/] } },
    { name: 'Tawk.to', category: 'live-chat', url: 'https://tawk.to', isSignal: false, patterns: { globals: ['Tawk_API'], scripts: [/tawk\.to/] } },
    { name: 'HubSpot', category: 'marketing-automation', url: 'https://hubspot.com', isSignal: false, patterns: { scripts: [/hubspot\.com/, /hs-scripts/] } },

    // ==================== COMMERCE & PAYMENTS ====================
    { name: 'Stripe', category: 'payment', url: 'https://stripe.com', isSignal: false, patterns: { globals: ['Stripe'], scripts: [/js\.stripe\.com/] } },
    { name: 'PayPal', category: 'payment', url: 'https://paypal.com', isSignal: false, patterns: { globals: ['paypal'], scripts: [/paypal\.com/] } },
    { name: 'Paddle', category: 'payment', url: 'https://paddle.com', isSignal: true, patterns: { globals: ['Paddle'], scripts: [/paddle\.com/] } },
    { name: 'LemonSqueezy', category: 'payment', url: 'https://lemonsqueezy.com', isSignal: true, patterns: { scripts: [/lemonsqueezy/] } },
    { name: 'Gumroad', category: 'payment', url: 'https://gumroad.com', isSignal: false, patterns: { scripts: [/gumroad/] } },

    // ==================== INFRASTRUCTURE ====================
    { name: 'Vercel', category: 'paas', url: 'https://vercel.com', isSignal: false, patterns: { headers: [{ name: 'x-vercel-id' }, { name: 'server', value: /vercel/i }] } },
    { name: 'Netlify', category: 'paas', url: 'https://netlify.com', isSignal: false, patterns: { headers: [{ name: 'x-nf-request-id' }, { name: 'server', value: /netlify/i }] } },
    { name: 'Cloudflare Pages', category: 'paas', url: 'https://pages.cloudflare.com', isSignal: false, patterns: { headers: [{ name: 'cf-ray' }, { name: 'x-cf-pages-id' }] } },
    { name: 'GitHub Pages', category: 'paas', url: 'https://pages.github.com', isSignal: false, patterns: { scripts: [/github\.io/], headers: [{ name: 'x-github-request-id' }, { name: 'server', value: /GitHub.com/i }] } },
    { name: 'Render', category: 'paas', url: 'https://render.com', isSignal: true, patterns: { scripts: [/onrender\.com/] } },
    { name: 'Railway', category: 'paas', url: 'https://railway.app', isSignal: true, patterns: { scripts: [/railway\.app/] } },
    { name: 'Fly.io', category: 'paas', url: 'https://fly.io', isSignal: true, patterns: { scripts: [/fly\.dev/] } },

    { name: 'Cloudflare', category: 'cdn', url: 'https://cloudflare.com', isSignal: false, patterns: { headers: [{ name: 'cf-ray' }, { name: 'server', value: /cloudflare/i }] } },
    { name: 'Fastly', category: 'cdn', url: 'https://fastly.com', isSignal: false, patterns: { headers: [{ name: 'x-served-by', value: /cache/ }, { name: 'server', value: /fastly/i }] } },
    { name: 'Amazon Web Services', category: 'paas', url: 'https://aws.amazon.com', isSignal: false, patterns: { headers: [{ name: 'x-amz-cf-id' }, { name: 'x-amz-request-id' }] } },
    { name: 'Amazon CloudFront', category: 'cdn', url: 'https://aws.amazon.com/cloudfront/', isSignal: false, patterns: { scripts: [/cloudfront\.net/], headers: [{ name: 'x-amz-cf-id' }] } },
    { name: 'Amazon S3', category: 'cdn', url: 'https://aws.amazon.com/s3/', isSignal: false, patterns: { scripts: [/s3\.amazonaws\.com/], headers: [{ name: 'server', value: /AmazonS3/i }, { name: 'x-amz-request-id' }] } },
    { name: 'Nginx', category: 'paas', url: 'https://nginx.org', isSignal: false, patterns: { headers: [{ name: 'server', value: /nginx/i }] } },
    { name: 'Google Cloud Platform', category: 'paas', url: 'https://cloud.google.com', isSignal: false, patterns: { headers: [{ name: 'via', value: /google/i }, { name: 'x-goog-generation' }] } },
    { name: 'Google Cloud CDN', category: 'cdn', url: 'https://cloud.google.com/cdn', isSignal: false, patterns: { headers: [{ name: 'via', value: /google/i }] } },

    // Backend Services
    { name: 'Firebase', category: 'backend-service', url: 'https://firebase.google.com', isSignal: false, patterns: { globals: ['firebase'], scripts: [/firebase/, /firebaseapp\.com/] } },
    { name: 'Supabase', category: 'backend-service', url: 'https://supabase.com', isSignal: true, patterns: { scripts: [/supabase/] } },
    { name: 'Appwrite', category: 'backend-service', url: 'https://appwrite.io', isSignal: true, patterns: { scripts: [/appwrite/] } },
    { name: 'PocketBase', category: 'backend-service', url: 'https://pocketbase.io', isSignal: true, patterns: { globals: ['PocketBase'] } },
    { name: 'Convex', category: 'backend-service', url: 'https://convex.dev', isSignal: true, patterns: { scripts: [/convex\.dev/] } },

    // Image CDN
    { name: 'Cloudinary', category: 'image-cdn', url: 'https://cloudinary.com', isSignal: false, patterns: { scripts: [/cloudinary\.com/] } },
    { name: 'Imgix', category: 'image-cdn', url: 'https://imgix.com', isSignal: false, patterns: { scripts: [/imgix\.net/] } },
    { name: 'ImageKit', category: 'image-cdn', url: 'https://imagekit.io', isSignal: true, patterns: { scripts: [/imagekit\.io/] } },

    // Video
    { name: 'YouTube', category: 'video', url: 'https://youtube.com', isSignal: false, patterns: { dom: ['iframe[src*="youtube"]'] } },
    { name: 'Vimeo', category: 'video', url: 'https://vimeo.com', isSignal: false, patterns: { dom: ['iframe[src*="vimeo"]'], scripts: [/vimeo\.com/] } },
    { name: 'Wistia', category: 'video', url: 'https://wistia.com', isSignal: false, patterns: { scripts: [/wistia/] } },
    { name: 'Mux', category: 'video', url: 'https://mux.com', isSignal: true, patterns: { scripts: [/mux\.com/] } },

    // Error Tracking
    { name: 'Sentry', category: 'error-tracking', url: 'https://sentry.io', isSignal: false, patterns: { globals: ['Sentry', '__SENTRY__'], scripts: [/sentry\.io/, /sentry-cdn/] }, versionGlobal: 'Sentry.SDK_VERSION' },
    { name: 'Bugsnag', category: 'error-tracking', url: 'https://bugsnag.com', isSignal: false, patterns: { globals: ['Bugsnag'], scripts: [/bugsnag/] } },
    { name: 'Rollbar', category: 'error-tracking', url: 'https://rollbar.com', isSignal: false, patterns: { globals: ['Rollbar'], scripts: [/rollbar/] } },
    { name: 'Highlight', category: 'error-tracking', url: 'https://highlight.io', isSignal: true, patterns: { scripts: [/highlight\.io/] } },

    // ==================== SECURITY & AUTH ====================
    { name: 'HSTS', category: 'security', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security', isSignal: false, patterns: { headers: [{ name: 'strict-transport-security' }] } },
    { name: 'reCAPTCHA', category: 'security', url: 'https://www.google.com/recaptcha/', isSignal: false, patterns: { globals: ['grecaptcha'], scripts: [/recaptcha/] } },
    { name: 'hCaptcha', category: 'security', url: 'https://hcaptcha.com', isSignal: false, patterns: { scripts: [/hcaptcha/] } },
    { name: 'Turnstile', category: 'security', url: 'https://www.cloudflare.com/products/turnstile/', isSignal: true, patterns: { dom: ['.cf-turnstile'], scripts: [/turnstile/] } },

    { name: 'Clerk', category: 'auth', url: 'https://clerk.com', isSignal: true, patterns: { scripts: [/clerk/] } },
    { name: 'Auth0', category: 'auth', url: 'https://auth0.com', isSignal: false, patterns: { scripts: [/auth0/] } },
    { name: 'NextAuth.js', category: 'auth', url: 'https://next-auth.js.org', isSignal: true, patterns: {} },
    { name: 'Supabase Auth', category: 'auth', url: 'https://supabase.com/auth', isSignal: true, patterns: {} },

    // Consent
    { name: 'OneTrust', category: 'consent', url: 'https://onetrust.com', isSignal: false, patterns: { scripts: [/onetrust/] } },
    { name: 'Cookiebot', category: 'consent', url: 'https://cookiebot.com', isSignal: false, patterns: { scripts: [/cookiebot/] } },
    { name: 'iubenda', category: 'consent', url: 'https://iubenda.com', isSignal: false, patterns: { scripts: [/iubenda/] } },

    // ==================== DEVELOPER TOOLS ====================
    { name: 'Webpack', category: 'build-tool', url: 'https://webpack.js.org', isSignal: false, patterns: { globals: ['webpackJsonp', 'webpackChunk'] } },
    { name: 'Vite', category: 'build-tool', url: 'https://vitejs.dev', isSignal: true, patterns: { scripts: [/@vite/] } },
    { name: 'Parcel', category: 'build-tool', url: 'https://parceljs.org', isSignal: false, patterns: { scripts: [/parcel/] } },
    { name: 'TypeScript', category: 'programming-lang', url: 'https://typescriptlang.org', isSignal: false, patterns: {} },

    // ==================== RICH CONTENT ====================
    { name: 'Google Maps', category: 'maps', url: 'https://developers.google.com/maps', isSignal: false, patterns: { scripts: [/maps\.googleapis\.com/] } },
    { name: 'Mapbox', category: 'maps', url: 'https://mapbox.com', isSignal: true, patterns: { globals: ['mapboxgl'], scripts: [/mapbox/] } },
    { name: 'Leaflet', category: 'maps', url: 'https://leafletjs.com', isSignal: false, patterns: { globals: ['L'], dom: ['.leaflet-container'] } },

    { name: 'Typeform', category: 'forms', url: 'https://typeform.com', isSignal: false, patterns: { scripts: [/typeform/] } },
    { name: 'Tally', category: 'forms', url: 'https://tally.so', isSignal: true, patterns: { scripts: [/tally\.so/] } },

    { name: 'TipTap', category: 'rich-text', url: 'https://tiptap.dev', isSignal: true, patterns: { dom: ['.ProseMirror'] } },
    { name: 'Quill', category: 'rich-text', url: 'https://quilljs.com', isSignal: false, patterns: { globals: ['Quill'], dom: ['.ql-editor'] } },
    { name: 'CKEditor', category: 'rich-text', url: 'https://ckeditor.com', isSignal: false, patterns: { globals: ['CKEDITOR', 'ClassicEditor'] } },

    { name: 'Prism', category: 'code-display', url: 'https://prismjs.com', isSignal: false, patterns: { globals: ['Prism'], dom: ['code[class*="language-"]'] } },
    { name: 'Highlight.js', category: 'code-display', url: 'https://highlightjs.org', isSignal: false, patterns: { globals: ['hljs'] } },
    { name: 'Monaco Editor', category: 'code-display', url: 'https://microsoft.github.io/monaco-editor/', isSignal: true, patterns: { globals: ['monaco'] } },
    { name: 'CodeMirror', category: 'code-display', url: 'https://codemirror.net', isSignal: false, patterns: { globals: ['CodeMirror'], dom: ['.cm-editor', '.CodeMirror'] } },

    // ==================== MISCELLANEOUS ====================
    { name: 'PWA', category: 'pwa', url: 'https://web.dev/progressive-web-apps/', isSignal: false, patterns: { dom: ['link[rel="manifest"]'] } },
    { name: 'Service Worker', category: 'pwa', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API', isSignal: false, patterns: {} },

    { name: 'Algolia', category: 'search', url: 'https://algolia.com', isSignal: false, patterns: { globals: ['algoliasearch'], scripts: [/algolia/] } },
    { name: 'Typesense', category: 'search', url: 'https://typesense.org', isSignal: true, patterns: { scripts: [/typesense/] } },
    { name: 'MeiliSearch', category: 'search', url: 'https://meilisearch.com', isSignal: true, patterns: { scripts: [/meilisearch/] } },

    { name: 'Socket.io', category: 'realtime', url: 'https://socket.io', isSignal: false, patterns: { globals: ['io'], scripts: [/socket\.io/] } },
    { name: 'Pusher', category: 'realtime', url: 'https://pusher.com', isSignal: false, patterns: { globals: ['Pusher'], scripts: [/pusher/] } },
    { name: 'Ably', category: 'realtime', url: 'https://ably.com', isSignal: true, patterns: { scripts: [/ably/] } },
    { name: 'Liveblocks', category: 'realtime', url: 'https://liveblocks.io', isSignal: true, patterns: { scripts: [/liveblocks/] } },
    { name: 'PartyKit', category: 'realtime', url: 'https://partykit.io', isSignal: true, patterns: { scripts: [/partykit/] } },

    { name: 'Weglot', category: 'i18n', url: 'https://weglot.com', isSignal: false, patterns: { globals: ['Weglot'], scripts: [/weglot/] } },

    { name: 'Canny', category: 'feedback', url: 'https://canny.io', isSignal: true, patterns: { scripts: [/canny\.io/] } },
    { name: 'Userpilot', category: 'feedback', url: 'https://userpilot.com', isSignal: false, patterns: { scripts: [/userpilot/] } },

    { name: 'Calendly', category: 'scheduling', url: 'https://calendly.com', isSignal: false, patterns: { scripts: [/calendly\.com/] } },
    { name: 'Cal.com', category: 'scheduling', url: 'https://cal.com', isSignal: true, patterns: { scripts: [/cal\.com/] } },

    { name: 'accessiBe', category: 'accessibility', url: 'https://accessibe.com', isSignal: false, patterns: { scripts: [/accessibe/] } },
    { name: 'UserWay', category: 'accessibility', url: 'https://userway.org', isSignal: false, patterns: { scripts: [/userway/] } },

    { name: 'Twitter/X', category: 'social', url: 'https://x.com', isSignal: false, patterns: { scripts: [/platform\.twitter\.com/, /platform\.x\.com/] } },
    { name: 'Facebook SDK', category: 'social', url: 'https://developers.facebook.com', isSignal: false, patterns: { scripts: [/connect\.facebook\.net/] } },

    { name: 'OpenAI', category: 'ai-tools', url: 'https://openai.com', isSignal: true, patterns: { scripts: [/openai/] } },
    { name: 'Vercel AI', category: 'ai-tools', url: 'https://sdk.vercel.ai', isSignal: true, patterns: {} },
    { name: 'Open Graph', category: 'seo', url: 'https://ogp.me', isSignal: false, patterns: { meta: [{ name: 'og:title' }, { name: 'og:type' }] } },

    // ==================== ADDED FOR LINKEDIN & BETTER COVERAGE ====================
    { name: 'LinkedIn Insight Tag', category: 'analytics', url: 'https://business.linkedin.com/marketing-solutions/insight-tag', isSignal: false, patterns: { globals: ['_linkedin_partner_id', '_linkedin_data_partner_ids', 'lintrk'], scripts: [/snap\.licdn\.com\/li\.lms-analytics\//] } },
    { name: 'Microsoft Power BI', category: 'analytics', url: 'https://powerbi.microsoft.com', isSignal: false, patterns: { globals: ['powerbi', 'powerbi-client'] } },
    { name: 'Tealium', category: 'tag-manager', url: 'https://tealium.com', isSignal: false, patterns: { globals: ['utag', 'utag_data'], scripts: [/utag\.js/] } },
    { name: 'PerimeterX', category: 'security', url: 'https://www.perimeterx.com', isSignal: false, patterns: { globals: ['_px', '_pxAppId', '_px2'], scripts: [/client\.perimeterx\.net/] } },
    { name: 'web-vitals', category: 'performance', url: 'https://web.dev/vitals/', isSignal: false, patterns: { globals: ['webVitals'] } },
    { name: 'core-js', category: 'js-library', url: 'https://github.com/zloirock/core-js', isSignal: false, patterns: { globals: ['__core-js_shared__', 'core'] }, versionGlobal: '__core-js_shared__.v' },
    { name: 'VideoJS', category: 'video', url: 'https://videojs.com', isSignal: false, patterns: { globals: ['videojs'], scripts: [/video\.js/] } },
    { name: 'Babel', category: 'build-tool', url: 'https://babeljs.io', isSignal: false, patterns: { globals: ['_babelPolyfill'] } },
    { name: 'Play', category: 'web-framework', url: 'https://www.playframework.com', isSignal: false, patterns: { headers: [{ name: 'set-cookie', value: /PLAY_SESSION/i }] }, implies: ['Scala', 'Java'] },
    { name: 'Scala', category: 'programming-lang', url: 'https://www.scala-lang.org', isSignal: false, patterns: { headers: [{ name: 'x-powered-by', value: /Scala/i }] } },
    { name: 'Java', category: 'programming-lang', url: 'https://www.java.com', isSignal: false, patterns: { headers: [{ name: 'x-powered-by', value: /Java/i }, { name: 'set-cookie', value: /JSESSIONID/i }] } },
    { name: 'New Relic', category: 'rum', url: 'https://newrelic.com', isSignal: false, patterns: { globals: ['newrelic', 'NREUM'], scripts: [/js-agent\.newrelic\.com/] } },
    { name: 'Cloudflare Bot Management', category: 'security', url: 'https://www.cloudflare.com/products/bot-management/', isSignal: false, patterns: { headers: [{ name: 'server', value: /cloudflare/i }], dom: ['script[src*="/cdn-cgi/challenge-platform/"]'] } },
    { name: 'Priority Hints', category: 'performance', url: 'https://web.dev/priority-hints/', isSignal: false, patterns: { dom: ['[fetchpriority]'] } },
    { name: 'HTTP/3', category: 'performance', url: 'https://en.wikipedia.org/wiki/HTTP/3', isSignal: false, patterns: { headers: [{ name: 'alt-svc', value: /h3/ }] } },
];
