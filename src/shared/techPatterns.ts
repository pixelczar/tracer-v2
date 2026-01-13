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
        // NEW: Additional detection methods
        cookies?: { name: string | RegExp; value?: RegExp }[];
        css?: RegExp[]; // Match against stylesheet contents
        html?: RegExp[]; // Match against raw HTML
        url?: RegExp[]; // Match against page URL
    };
    // Per-pattern confidence (0-100, default 100)
    confidence?: number;
    versionGlobal?: string;
    versionDom?: { selector: string; attribute?: string; regex?: RegExp };
    // Version extraction from script src or other pattern via regex capture group
    versionScript?: RegExp;
    implies?: string[];
    // NEW: Mutually exclusive technologies (if this is detected, exclude these)
    excludes?: string[];
    // NEW: Required technologies (only detect if these are also present)
    requires?: string[];
}

export const TECH_PATTERNS: TechPattern[] = [
    // ==================== FRONTEND ====================
    // JS Frameworks
    { name: 'React', category: 'js-framework', url: 'https://react.dev', isSignal: false, patterns: { globals: ['React', '__REACT_DEVTOOLS_GLOBAL_HOOK__', '_reactListening', '__react_router_build_config'], dom: ['[data-reactroot]', '[data-react-helmet]', '#react-root', '#root'] }, versionGlobal: 'React.version' },
    { name: 'Vue.js', category: 'js-framework', url: 'https://vuejs.org', isSignal: false, patterns: { globals: ['Vue', '__VUE__', '__VUE_DEVTOOLS_GLOBAL_HOOK__'], dom: ['[data-v-]'] }, versionGlobal: 'Vue.version' },
    { name: 'Svelte', category: 'js-framework', url: 'https://svelte.dev', isSignal: true, patterns: { globals: ['__svelte'], dom: ['[class*="svelte-"]'] } },
    { name: 'Angular', category: 'js-framework', url: 'https://angular.io', isSignal: false, patterns: { dom: ['[ng-version]', '[_ngcontent-]'] }, confidence: 100 },
    { name: 'AngularJS', category: 'js-framework', url: 'https://angularjs.org', isSignal: false, patterns: { globals: ['angular'], scripts: [/angular\.js/, /angularjs/], dom: ['[ng-app]', '[ng-controller]', '[ng-model]'] }, excludes: ['Angular'] },
    { name: 'Solid', category: 'js-framework', url: 'https://solidjs.com', isSignal: true, patterns: { globals: ['_$HY', 'Solid'] } },
    { name: 'Preact', category: 'js-framework', url: 'https://preactjs.com', isSignal: false, patterns: { globals: ['preact', '__PREACT_DEVTOOLS__'] } },
    { name: 'Alpine.js', category: 'js-framework', url: 'https://alpinejs.dev', isSignal: true, patterns: { globals: ['Alpine'], dom: ['[x-data]', '[x-init]'] } },
    { name: 'Lit', category: 'js-framework', url: 'https://lit.dev', isSignal: true, patterns: { globals: ['lit', 'litHtml'] } },
    { name: 'HTMX', category: 'js-framework', url: 'https://htmx.org', isSignal: true, patterns: { globals: ['htmx'], dom: ['[hx-get]', '[hx-post]', '[hx-trigger]'] } },
    { name: 'Qwik', category: 'js-framework', url: 'https://qwik.builder.io', isSignal: true, patterns: { globals: ['qwik'], dom: ['[q\\:container]'] } },
    { name: 'Stimulus', category: 'js-framework', url: 'https://stimulus.hotwired.dev', isSignal: true, patterns: { globals: ['Stimulus'], dom: ['[data-controller]'] } },
    { name: 'Ember', category: 'js-framework', url: 'https://emberjs.com', isSignal: false, patterns: { globals: ['Ember'] }, confidence: 85 },

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
    { 
        name: 'Radix UI', 
        category: 'ui-framework', 
        url: 'https://radix-ui.com', 
        isSignal: true, 
        patterns: { 
            // Radix UI uses data-radix-* attributes extensively
            dom: [
                '[data-radix-collection-item]', 
                '[data-radix-popper-content-wrapper]',
                '[data-radix-portal]',
                '[data-radix-dialog-content]',
                '[data-radix-dropdown-menu-content]',
                '[data-radix-select-content]',
                '[data-radix-popover-content]',
                '[data-radix-tooltip-content]',
                '[data-radix-accordion-item]',
                '[data-radix-tabs-list]',
                '[data-radix-tabs-content]',
                '[data-radix-scroll-area]',
                '[data-radix-slider-root]',
                '[data-radix-checkbox-root]',
                '[data-radix-radio-group]',
                '[data-radix-switch-root]',
                // More generic pattern for any data-radix-* attribute
                '[data-radix-]',
            ],
            // Check for Radix UI in scripts
            scripts: [/@radix-ui/i, /radix-ui/i],
            globals: ['RadixUI'],
        },
        confidence: 85,
    },
    { name: 'Shadcn UI', category: 'ui-framework', url: 'https://ui.shadcn.com', isSignal: true, patterns: {} },
    { name: 'Material UI', category: 'ui-framework', url: 'https://mui.com', isSignal: false, patterns: { globals: ['MaterialUI'], dom: ['[class*="Mui"]'] } },
    { name: 'Chakra UI', category: 'ui-framework', url: 'https://chakra-ui.com', isSignal: true, patterns: { dom: ['[class*="chakra-"]'] } },
    { name: 'Headless UI', category: 'ui-framework', url: 'https://headlessui.com', isSignal: true, patterns: { dom: ['[data-headlessui-state]'] } },
    { name: 'Mantine', category: 'ui-framework', url: 'https://mantine.dev', isSignal: true, patterns: { dom: ['[class*="mantine-"]'] } },
    { name: 'Ant Design', category: 'ui-framework', url: 'https://ant.design', isSignal: false, patterns: { dom: ['[class*="ant-"]'] } },
    { name: 'NextUI', category: 'ui-framework', url: 'https://nextui.org', isSignal: true, patterns: { dom: ['[class*="nextui-"]'] } },
    { name: 'DaisyUI', category: 'ui-framework', url: 'https://daisyui.com', isSignal: true, patterns: { dom: ['.btn-primary.btn-sm', '.card.bg-base-200', '.navbar.bg-base-100', '.footer.p-10.bg-base-200'] } },
    { name: 'HeroUI', category: 'ui-framework', url: 'https://heroui.com', isSignal: true, patterns: { dom: ['[class*="heroui-"]'], scripts: [/heroui/i] }, implies: ['React', 'Tailwind CSS'] },
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
    { 
        name: 'Tailwind CSS', 
        category: 'css-framework', 
        url: 'https://tailwindcss.com', 
        isSignal: false, 
        patterns: { 
            // Tailwind-specific patterns
            dom: [
                'html.tw-dark', // Tailwind dark mode indicator
                '[class*="tw-"]', // Tailwind-specific prefix
            ],
            globals: ['tailwind'],
            // Check for Tailwind directives in CSS (most reliable)
            css: [/@tailwind\s+(base|components|utilities)/i, /tailwindcss/i],
            // Check for Tailwind config in scripts
            scripts: [/tailwind\.config/i, /tailwindcss/i],
            // Check HTML for Tailwind-specific patterns
            html: [/tailwindcss/i, /@tailwind/i],
        },
        confidence: 90, // Higher confidence for CSS/script patterns, lower for DOM
    },
    { name: 'Bootstrap', category: 'css-framework', url: 'https://getbootstrap.com', isSignal: false, patterns: { globals: ['bootstrap'], dom: ['.container-fluid', '.row', '.col-md-'] } },
    { name: 'Bulma', category: 'css-framework', url: 'https://bulma.io', isSignal: false, patterns: { dom: ['.is-primary.button', '.columns'] } },
    { name: 'styled-components', category: 'css-in-js', url: 'https://styled-components.com', isSignal: false, patterns: { globals: ['styled', '__styled-components__'], dom: ['style[data-styled]', '[class*="sc-"]', 'style[data-styled-components]'], scripts: [/styled-components/] } },
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
    { name: 'Framer Motion', category: 'animation', url: 'https://www.framer.com/motion/', isSignal: true, patterns: { globals: ['motion', 'framerMotion', '__motion'], scripts: [/framer-motion/, /@motion/, /motion\/react/], dom: ['[data-framer-appear-id]'] } },
    { name: 'Anime.js', category: 'animation', url: 'https://animejs.com', isSignal: true, patterns: { globals: ['anime'] } },
    { name: 'Lottie', category: 'animation', url: 'https://lottiefiles.com', isSignal: true, patterns: { globals: ['lottie'], dom: ['lottie-player', 'dotlottie-player'] } },
    { name: 'Rive', category: 'animation', url: 'https://rive.app', isSignal: true, patterns: { globals: ['rive'], dom: ['canvas[data-rive]'] } },
    { name: 'AOS', category: 'animation', url: 'https://michalsnik.github.io/aos/', isSignal: false, patterns: { globals: ['AOS'], dom: ['[data-aos]'] } },
    { name: 'ScrollReveal', category: 'animation', url: 'https://scrollrevealjs.org', isSignal: false, patterns: { globals: ['ScrollReveal'] } },
    { name: 'Locomotive Scroll', category: 'animation', url: 'https://locomotivemtl.github.io/locomotive-scroll/', isSignal: true, patterns: { dom: ['[data-scroll]', '[data-scroll-container]'] } },
    { name: 'Lenis', category: 'animation', url: 'https://lenis.studiofreight.com', isSignal: true, patterns: { globals: ['Lenis'] } },
    { name: 'Barba.js', category: 'animation', url: 'https://barba.js.org', isSignal: true, patterns: { globals: ['barba'], dom: ['[data-barba]'] } },
    { name: 'Swup', category: 'animation', url: 'https://swup.js.org', isSignal: true, patterns: { globals: ['swup'] } },
    { name: 'Curtains.js', category: 'webgl', url: 'https://www.curtainsjs.com', isSignal: true, patterns: { globals: ['Curtains'] } },
    { name: 'Theatre.js', category: 'animation', url: 'https://www.theatrejs.com', isSignal: true, patterns: { globals: ['__theatrejs'] } },

    // WebGL / 3D
    { name: 'Three.js', category: 'webgl', url: 'https://threejs.org', isSignal: true, patterns: { globals: ['THREE', '__THREE__'], scripts: [/three/i] }, versionGlobal: 'THREE.REVISION' },
    { name: 'React Three Fiber', category: 'webgl', url: 'https://docs.pmnd.rs/react-three-fiber', isSignal: true, patterns: { scripts: [/react-three-fiber/i, /@react-three\/fiber/i, /@react-three\/drei/i], globals: ['__R3F__'] }, implies: ['Three.js', 'React'] },
    { name: 'Babylon.js', category: 'webgl', url: 'https://babylonjs.com', isSignal: true, patterns: { globals: ['BABYLON'] } },
    { name: 'PixiJS', category: 'webgl', url: 'https://pixijs.com', isSignal: true, patterns: { globals: ['PIXI'] } },
    { name: 'A-Frame', category: 'webgl', url: 'https://aframe.io', isSignal: true, patterns: { dom: ['a-scene', 'a-entity'] } },
    { name: 'Spline', category: 'webgl', url: 'https://spline.design', isSignal: true, patterns: { scripts: [/spline/i], dom: ['spline-viewer'] } },
    { name: 'Unicorn Studio', category: 'webgl', url: 'https://unicorn.studio', isSignal: true, patterns: { globals: ['UnicornStudio'], scripts: [/unicornStudio/i], dom: ['[data-us-project]', '[data-scene-id]'] } },
    { name: 'model-viewer', category: 'webgl', url: 'https://modelviewer.dev', isSignal: true, patterns: { dom: ['model-viewer'] } },

    // Canvas & SVG
    { name: 'Canvas API', category: 'canvas', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API', isSignal: false, patterns: { dom: ['canvas'] } },
    { name: 'Fabric.js', category: 'canvas', url: 'http://fabricjs.com', isSignal: true, patterns: { globals: ['fabric'] } },
    { name: 'Konva', category: 'canvas', url: 'https://konvajs.org', isSignal: true, patterns: { globals: ['Konva'] } },
    { name: 'Paper.js', category: 'canvas', url: 'http://paperjs.org', isSignal: true, patterns: { globals: ['paper'] } },
    { name: 'p5.js', category: 'canvas', url: 'https://p5js.org', isSignal: true, patterns: { globals: ['p5'] } },
    { name: 'Paper', category: 'shaders', url: 'https://paper.design', isSignal: true, patterns: { dom: ['[data-paper-shader]'], scripts: [/paper\.design/], html: [/paper-shader/i] } },

    // Data Visualization
    { name: 'D3.js', category: 'dataviz', url: 'https://d3js.org', isSignal: true, patterns: { globals: ['d3'] } },
    { name: 'Chart.js', category: 'dataviz', url: 'https://chartjs.org', isSignal: false, patterns: { globals: ['Chart'] } },
    { name: 'Recharts', category: 'dataviz', url: 'https://recharts.org', isSignal: true, patterns: { dom: ['.recharts-wrapper'] } },
    { name: 'ECharts', category: 'dataviz', url: 'https://echarts.apache.org', isSignal: false, patterns: { globals: ['echarts'] } },
    { name: 'Highcharts', category: 'dataviz', url: 'https://highcharts.com', isSignal: false, patterns: { globals: ['Highcharts'] } },
    { name: 'ApexCharts', category: 'dataviz', url: 'https://apexcharts.com', isSignal: false, patterns: { globals: ['ApexCharts'] } },
    { name: 'Plotly', category: 'dataviz', url: 'https://plotly.com', isSignal: false, patterns: { globals: ['Plotly'] } },

    // ==================== CONTENT & CMS ====================
    { name: 'WordPress', category: 'cms', url: 'https://wordpress.org', isSignal: false, patterns: { meta: [{ name: 'generator', content: /WordPress/i }], cookies: [{ name: 'wordpress_logged_in' }, { name: /^wp-/i }] }, excludes: ['Drupal'], confidence: 100 },
    { name: 'Contentful', category: 'cms', url: 'https://contentful.com', isSignal: false, patterns: { scripts: [/contentful\.com/, /contentfulcdn\.com/, /spaces\.contentful/], globals: ['contentful'] }, confidence: 85 },
    { name: 'Sanity', category: 'cms', url: 'https://sanity.io', isSignal: true, patterns: { globals: ['sanity', '__sanity'], scripts: [/sanity\.io/, /sanitycdn\.com/, /sanity-studio/] } },
    { name: 'Strapi', category: 'cms', url: 'https://strapi.io', isSignal: true, patterns: { globals: ['strapi'], meta: [{ name: 'generator', content: /Strapi/i }] } },
    { name: 'Storyblok', category: 'cms', url: 'https://storyblok.com', isSignal: true, patterns: { scripts: [/storyblok/, /storyblokcdn\.com/], globals: ['storyblok'], dom: ['[data-storyblok]'] } },
    { name: 'Prismic', category: 'cms', url: 'https://prismic.io', isSignal: false, patterns: { scripts: [/prismic\.io/] } },
    { name: 'Ghost', category: 'cms', url: 'https://ghost.org', isSignal: false, patterns: { meta: [{ name: 'generator', content: /Ghost/i }] } },
    { name: 'Drupal', category: 'cms', url: 'https://drupal.org', isSignal: false, patterns: { meta: [{ name: 'generator', content: /Drupal/i }], scripts: [/\/sites\/.*\/files\//, /\/misc\/drupal\.js/, /\/core\/misc\/drupal/], cookies: [{ name: /^SESS[0-9a-f]{32}$/i }, { name: /^SSESS[0-9a-f]{32}$/i }], dom: ['[data-drupal-]', '[class*="drupal"]'] }, excludes: ['WordPress'], confidence: 85 },
    { name: 'Joomla', category: 'cms', url: 'https://joomla.org', isSignal: false, patterns: { meta: [{ name: 'generator', content: /Joomla/i }], scripts: [/\/media\/joomla/, /\/components\//], cookies: [{ name: /^joomla/i }], dom: ['[class*="joomla"]'] } },
    { name: 'Craft CMS', category: 'cms', url: 'https://craftcms.com', isSignal: true, patterns: { meta: [{ name: 'generator', content: /Craft CMS/i }], scripts: [/craftcms/, /\/cpresources\//], cookies: [{ name: 'CraftSessionId' }] } },
    { name: 'Payload', category: 'cms', url: 'https://payloadcms.com', isSignal: true, patterns: { scripts: [/payloadcms/, /\/api\/payload/, /payload.*cms/], globals: ['payload'] }, confidence: 85 },
    { name: 'Directus', category: 'cms', url: 'https://directus.io', isSignal: true, patterns: { scripts: [/directus/, /\/directus\//], globals: ['directus'] } },
    { name: 'Keystone', category: 'cms', url: 'https://keystonejs.com', isSignal: true, patterns: { scripts: [/keystone/, /keystonejs/], globals: ['keystone'] } },
    { name: 'Format', category: 'cms', url: 'https://format.com', isSignal: false, patterns: { scripts: [/format\.com/, /formatcdn\.com/], url: [/\.format\.com$/], meta: [{ name: 'generator', content: /Format/i }] } },

    // E-commerce
    { name: 'Shopify', category: 'ecommerce', url: 'https://shopify.com', isSignal: false, patterns: { globals: ['Shopify'], scripts: [/cdn\.shopify\.com/], cookies: [{ name: '_shopify_s' }, { name: 'cart_currency' }] } },
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
    { name: 'Google Analytics', category: 'analytics', url: 'https://analytics.google.com', isSignal: false, patterns: { globals: ['ga', 'gtag'], scripts: [/google-analytics\.com/, /googletagmanager\.com/], cookies: [{ name: '_ga' }, { name: /^_ga_/ }] } },
    { name: 'Google Ads', category: 'analytics', url: 'https://ads.google.com', isSignal: false, patterns: { scripts: [/googleadservices\.com/, /googlesyndication\.com/, /doubleclick\.net/], cookies: [{ name: /^_gcl/ }, { name: 'IDE' }] } },
    { name: 'Google Ads Conversion Tracking', category: 'analytics', url: 'https://ads.google.com', isSignal: false, patterns: { scripts: [/googleadservices\.com\/pagead\/conversion/, /googlesyndication\.com/], globals: ['google_conversion_id'] } },
    { name: 'DoubleClick Floodlight', category: 'analytics', url: 'https://marketingplatform.google.com/about/tag-manager/', isSignal: false, patterns: { scripts: [/fls\.doubleclick\.net/, /stats\.g\.doubleclick\.net/], cookies: [{ name: 'test_cookie' }] } },
    { name: 'Plausible', category: 'analytics', url: 'https://plausible.io', isSignal: true, patterns: { scripts: [/plausible\.io/] } },
    { name: 'Fathom', category: 'analytics', url: 'https://usefathom.com', isSignal: true, patterns: { scripts: [/usefathom\.com/] } },
    { name: 'PostHog', category: 'analytics', url: 'https://posthog.com', isSignal: true, patterns: { globals: ['posthog', '__posthog'], scripts: [/posthog\.com/, /posthog\.io/, /posthog-js/] } },
    { name: 'Amplitude', category: 'analytics', url: 'https://amplitude.com', isSignal: false, patterns: { globals: ['amplitude'], scripts: [/amplitude\.com/] } },
    { name: 'Mixpanel', category: 'analytics', url: 'https://mixpanel.com', isSignal: false, patterns: { globals: ['mixpanel'], scripts: [/mixpanel\.com/] } },
    { name: 'Heap', category: 'analytics', url: 'https://heap.io', isSignal: false, patterns: { globals: ['heap'], scripts: [/heap\.io/] } },
    { name: 'Quora Pixel', category: 'analytics', url: 'https://www.quora.com/business', isSignal: false, patterns: { scripts: [/qevents\.quora\.com/, /quora\.com\/pixel/] } },
    { name: 'FullStory', category: 'heatmaps', url: 'https://fullstory.com', isSignal: false, patterns: { globals: ['FS'], scripts: [/fullstory\.com/] } },
    { name: 'Hotjar', category: 'heatmaps', url: 'https://hotjar.com', isSignal: false, patterns: { globals: ['hj', '_hjSettings'], scripts: [/hotjar\.com/], cookies: [{ name: /^_hj/ }] } },
    { name: 'LogRocket', category: 'heatmaps', url: 'https://logrocket.com', isSignal: false, patterns: { globals: ['LogRocket'], scripts: [/logrocket/] } },
    { name: 'Clarity', category: 'heatmaps', url: 'https://clarity.microsoft.com', isSignal: false, patterns: { scripts: [/clarity\.ms/] } },

    // A/B Testing
    { name: 'Optimizely', category: 'ab-testing', url: 'https://optimizely.com', isSignal: false, patterns: { globals: ['optimizely'], scripts: [/optimizely/], cookies: [{ name: 'optimizelyEndUserId' }] } },
    { name: 'LaunchDarkly', category: 'ab-testing', url: 'https://launchdarkly.com', isSignal: true, patterns: { scripts: [/launchdarkly/] } },
    { name: 'Statsig', category: 'ab-testing', url: 'https://statsig.com', isSignal: true, patterns: { scripts: [/statsig/] } },
    { name: 'GrowthBook', category: 'ab-testing', url: 'https://growthbook.io', isSignal: true, patterns: { globals: ['growthbook'] } },

    // CDP & Tag Management
    { name: 'Segment', category: 'customer-data', url: 'https://segment.com', isSignal: false, patterns: { globals: ['analytics'], scripts: [/segment\.com/], cookies: [{ name: 'ajs_user_id' }, { name: 'ajs_anonymous_id' }] } },
    { name: 'RudderStack', category: 'customer-data', url: 'https://rudderstack.com', isSignal: true, patterns: { scripts: [/rudderstack/] } },
    { name: 'Google Tag Manager', category: 'tag-manager', url: 'https://tagmanager.google.com', isSignal: false, patterns: { scripts: [/googletagmanager\.com\/gtm/] } },

    // Live Chat
    { name: 'Intercom', category: 'live-chat', url: 'https://intercom.com', isSignal: false, patterns: { globals: ['Intercom'], scripts: [/widget\.intercom\.io/, /js\.intercomcdn\.com/, /intercom\.io\/widget/], cookies: [{ name: 'intercom-session' }, { name: /^intercom-/i }] }, confidence: 85 },
    { name: 'Zendesk', category: 'live-chat', url: 'https://zendesk.com', isSignal: false, patterns: { scripts: [/static\.zdassets\.com/, /widget\.zendesk\.com/, /zendesk\.com\/embeddable/], globals: ['zE'] }, confidence: 85 },
    { name: 'Drift', category: 'live-chat', url: 'https://drift.com', isSignal: false, patterns: { globals: ['drift'], scripts: [/drift\.com/] } },
    { name: 'Crisp', category: 'live-chat', url: 'https://crisp.chat', isSignal: false, patterns: { globals: ['$crisp'], scripts: [/crisp\.chat/] } },
    { name: 'Tawk.to', category: 'live-chat', url: 'https://tawk.to', isSignal: false, patterns: { globals: ['Tawk_API'], scripts: [/tawk\.to/] } },
    { name: 'HubSpot', category: 'marketing-automation', url: 'https://hubspot.com', isSignal: false, patterns: { scripts: [/js\.hs-scripts\.com/, /js\.hubspot\.com/, /hs-scripts\.com/], cookies: [{ name: 'hubspotutk' }, { name: '__hstc' }, { name: '__hssc' }], globals: ['hsq'] }, confidence: 85 },

    // ==================== COMMERCE & PAYMENTS ====================
    { name: 'Stripe', category: 'payment', url: 'https://stripe.com', isSignal: false, patterns: { globals: ['Stripe'], scripts: [/js\.stripe\.com/], cookies: [{ name: '__stripe_mid' }, { name: '__stripe_sid' }] } },
    { name: 'PayPal', category: 'payment', url: 'https://paypal.com', isSignal: false, patterns: { globals: ['paypal'], scripts: [/www\.paypal\.com\/sdk/, /paypalobjects\.com/, /paypal\.com\/js/] }, confidence: 85 },
    { name: 'Paddle', category: 'payment', url: 'https://paddle.com', isSignal: true, patterns: { globals: ['Paddle'], scripts: [/cdn\.paddle\.com/, /paddle\.com\/paddle\.js/] }, confidence: 85 },
    { name: 'LemonSqueezy', category: 'payment', url: 'https://lemonsqueezy.com', isSignal: true, patterns: { scripts: [/cdn\.lemonsqueezy\.com/, /lemonsqueezy\.com\/js/, /lemonsqueezy\.com\/embed/], globals: ['LemonSqueezy'] }, confidence: 85 },
    { name: 'Gumroad', category: 'payment', url: 'https://gumroad.com', isSignal: false, patterns: { scripts: [/gumroad/] } },

    // ==================== INFRASTRUCTURE ====================
    { name: 'Vercel', category: 'paas', url: 'https://vercel.com', isSignal: false, patterns: { headers: [{ name: 'x-vercel-id' }, { name: 'server', value: /vercel/i }] } },
    { name: 'Netlify', category: 'paas', url: 'https://netlify.com', isSignal: false, patterns: { headers: [{ name: 'x-nf-request-id' }, { name: 'server', value: /netlify/i }] } },
    { name: 'Cloudflare Pages', category: 'paas', url: 'https://pages.cloudflare.com', isSignal: false, patterns: { headers: [{ name: 'cf-ray' }, { name: 'x-cf-pages-id' }] } },
    { name: 'GitHub Pages', category: 'paas', url: 'https://pages.github.com', isSignal: false, patterns: { scripts: [/github\.io/], headers: [{ name: 'x-github-request-id' }, { name: 'server', value: /GitHub.com/i }] } },
    { name: 'Render', category: 'paas', url: 'https://render.com', isSignal: true, patterns: { scripts: [/onrender\.com/] } },
    { name: 'Railway', category: 'paas', url: 'https://railway.app', isSignal: true, patterns: { scripts: [/railway\.app/] } },
    { name: 'Fly.io', category: 'paas', url: 'https://fly.io', isSignal: true, patterns: { scripts: [/fly\.dev/] } },

    { name: 'Cloudflare', category: 'cdn', url: 'https://cloudflare.com', isSignal: false, patterns: { headers: [{ name: 'cf-ray' }, { name: 'server', value: /cloudflare/i }], cookies: [{ name: '__cf_bm' }, { name: 'cf_clearance' }] } },
    { name: 'Fastly', category: 'cdn', url: 'https://fastly.com', isSignal: false, patterns: { headers: [{ name: 'x-served-by', value: /cache/ }, { name: 'server', value: /fastly/i }] } },
    { name: 'Amazon Web Services', category: 'paas', url: 'https://aws.amazon.com', isSignal: false, patterns: { headers: [{ name: 'x-amz-cf-id' }, { name: 'x-amz-request-id' }, { name: 'x-amzn-requestid' }, { name: 'x-amzn-trace-id' }, { name: 'server', value: /AmazonS3|CloudFront|ELB/i }], scripts: [/\.amazonaws\.com/, /aws\.amazon\.com/, /amazonaws\.com/], cookies: [{ name: /^AWS/i }, { name: /^aws/i }] } },
    { name: 'Amazon CloudFront', category: 'cdn', url: 'https://aws.amazon.com/cloudfront/', isSignal: false, patterns: { scripts: [/cloudfront\.net/], headers: [{ name: 'x-amz-cf-id' }] } },
    { name: 'Amazon S3', category: 'cdn', url: 'https://aws.amazon.com/s3/', isSignal: false, patterns: { scripts: [/s3\.amazonaws\.com/], headers: [{ name: 'server', value: /AmazonS3/i }, { name: 'x-amz-request-id' }] } },
    { name: 'Azure Edge Network', category: 'cdn', url: 'https://azure.microsoft.com', isSignal: false, patterns: { headers: [{ name: 'x-azure-ref', value: /^0\.[A-Z0-9]+/ }, { name: 'server', value: /Microsoft-HTTPAPI/i }] } },
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
    { name: 'reCAPTCHA', category: 'security', url: 'https://www.google.com/recaptcha/', isSignal: false, patterns: { globals: ['grecaptcha', '___grecaptcha_cfg'], scripts: [/recaptcha/i] } },
    { name: 'hCaptcha', category: 'security', url: 'https://hcaptcha.com', isSignal: false, patterns: { scripts: [/hcaptcha/] } },
    { name: 'Turnstile', category: 'security', url: 'https://www.cloudflare.com/products/turnstile/', isSignal: true, patterns: { dom: ['.cf-turnstile'], scripts: [/turnstile/] } },

    { name: 'Clerk', category: 'auth', url: 'https://clerk.com', isSignal: true, patterns: { scripts: [/clerk/] } },
    { name: 'Auth0', category: 'auth', url: 'https://auth0.com', isSignal: false, patterns: { scripts: [/auth0/] } },
    { name: 'NextAuth.js', category: 'auth', url: 'https://next-auth.js.org', isSignal: true, patterns: {} },
    { name: 'Supabase Auth', category: 'auth', url: 'https://supabase.com/auth', isSignal: true, patterns: {} },
    { name: 'Google Sign-in', category: 'auth', url: 'https://developers.google.com/identity/sign-in/web', isSignal: false, patterns: { scripts: [/apis\.google\.com\/js\/platform\.js/, /accounts\.google\.com\/gsi/], globals: ['gapi', 'google'], dom: ['[data-google-signin]', '.g-signin2'] } },

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
    { name: 'Leaflet', category: 'maps', url: 'https://leafletjs.com', isSignal: false, patterns: { scripts: [/leaflet\.js/, /leaflet\.css/], dom: ['.leaflet-container', '.leaflet-map-pane'] }, confidence: 85 },

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

    { name: 'Socket.io', category: 'realtime', url: 'https://socket.io', isSignal: false, patterns: { scripts: [/socket\.io/, /socketio/], globals: ['io'] }, confidence: 75 },
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
    { name: 'Cloudflare Browser Insights', category: 'rum', url: 'https://developers.cloudflare.com/analytics/web-analytics/', isSignal: false, patterns: { scripts: [/cloudflareinsights\.com/, /\/cdn-cgi\/rum/], headers: [{ name: 'cf-ray' }] }, requires: ['Cloudflare'] },
    { name: 'Cloudflare Bot Management', category: 'security', url: 'https://www.cloudflare.com/products/bot-management/', isSignal: false, patterns: { headers: [{ name: 'server', value: /cloudflare/i }], dom: ['script[src*="/cdn-cgi/challenge-platform/"]'] } },
    { name: 'Priority Hints', category: 'performance', url: 'https://web.dev/priority-hints/', isSignal: false, patterns: { dom: ['[fetchpriority]'] } },
    { name: 'HTTP/3', category: 'performance', url: 'https://en.wikipedia.org/wiki/HTTP/3', isSignal: false, patterns: { headers: [{ name: 'alt-svc', value: /h3/ }] } },

    // ==================== AI-GENERATED SITES ====================
    // AI Code Generators / Site Builders
    {
        name: 'v0',
        category: 'ai-generated',
        url: 'https://v0.dev',
        isSignal: true,
        patterns: {
            url: [/\.v0\.dev$/, /vusercontent\.net/],
            scripts: [/v0\.dev/, /vusercontent\.net/],
            meta: [{ name: 'generator', content: /v0/i }],
        },
        confidence: 100,
        implies: ['React', 'Next.js', 'Tailwind CSS', 'Shadcn UI', 'Radix UI', 'Lucide'],
    },
    {
        name: 'Lovable',
        category: 'ai-generated',
        url: 'https://lovable.dev',
        isSignal: true,
        patterns: {
            url: [/\.lovable\.app$/, /lovable\.dev/],
            scripts: [/lovable\.app/, /lovable\.dev/],
            meta: [{ name: 'generator', content: /lovable/i }, { name: 'generator', content: /gpt-engineer/i }],
            html: [/Made with Lovable/i, /Built with Lovable/i],
        },
        confidence: 100,
        implies: ['React', 'Vite', 'Tailwind CSS', 'Shadcn UI', 'Supabase'],
    },
    {
        name: 'Bolt',
        category: 'ai-generated',
        url: 'https://bolt.new',
        isSignal: true,
        patterns: {
            url: [/\.bolt\.new$/, /bolt\.new/],
            scripts: [/bolt\.new/, /stackblitz/i],
            globals: ['__BOLT__', 'webcontainer'],
            meta: [{ name: 'generator', content: /bolt/i }],
        },
        confidence: 100,
        implies: ['Vite'],
    },
    {
        name: 'Replit',
        category: 'ai-generated',
        url: 'https://replit.com',
        isSignal: false,
        patterns: {
            url: [/\.repl\.co$/, /\.replit\.app$/, /\.replit\.dev$/],
            scripts: [/replit\.com/, /repl\.co/, /replit\.app/],
            globals: ['__REPLIT__', 'replit'],
            headers: [{ name: 'x-replit-cluster' }],
            meta: [{ name: 'generator', content: /replit/i }],
        },
        confidence: 100,
    },
    {
        name: 'StackBlitz',
        category: 'ai-generated',
        url: 'https://stackblitz.com',
        isSignal: true,
        patterns: {
            url: [/\.stackblitz\.io$/, /stackblitz\.com/],
            scripts: [/stackblitz/],
            globals: ['StackBlitzSDK', 'webcontainer'],
        },
        confidence: 100,
    },
    {
        name: 'CodeSandbox',
        category: 'ai-generated',
        url: 'https://codesandbox.io',
        isSignal: false,
        patterns: {
            url: [/\.csb\.app$/, /codesandbox\.io/],
            scripts: [/codesandbox/],
            globals: ['__CSB__'],
        },
        confidence: 100,
    },
    {
        name: 'Glitch',
        category: 'ai-generated',
        url: 'https://glitch.com',
        isSignal: false,
        patterns: {
            url: [/\.glitch\.me$/],
            scripts: [/glitch\.com/, /glitch\.me/],
            meta: [{ name: 'generator', content: /glitch/i }],
        },
        confidence: 100,
    },
    {
        name: 'Vercel v0',
        category: 'ai-generated',
        url: 'https://v0.dev',
        isSignal: true,
        patterns: {
            // Heuristic: Vercel + Shadcn + specific patterns often indicate v0
            html: [/generated by v0/i, /v0\.dev/],
        },
        confidence: 80,
        requires: ['Vercel', 'Shadcn UI'],
    },
    {
        name: 'Create React App',
        category: 'ai-generated',
        url: 'https://create-react-app.dev',
        isSignal: false,
        patterns: {
            html: [/You need to enable JavaScript to run this app/],
            meta: [{ name: 'generator', content: /create-react-app/i }],
        },
        confidence: 100,
        requires: ['React'],
    },
    {
        name: 'Vite Starter',
        category: 'ai-generated',
        url: 'https://vitejs.dev',
        isSignal: false,
        patterns: {
            // Default Vite React starter has this exact structure
            html: [/<div id="root"><\/div>/],
            scripts: [/@vite\/client/, /src\/main\.tsx/, /src\/main\.ts/],
        },
        confidence: 60,
        requires: ['Vite'],
    },
    {
        name: 'GitHub Copilot Workspace',
        category: 'ai-generated',
        url: 'https://github.com/features/copilot',
        isSignal: true,
        patterns: {
            meta: [{ name: 'generator', content: /copilot/i }],
            html: [/GitHub Copilot/i],
        },
        confidence: 90,
    },
    {
        name: 'Cursor',
        category: 'ai-generated',
        url: 'https://cursor.com',
        isSignal: true,
        patterns: {
            meta: [{ name: 'generator', content: /cursor/i }],
            html: [/Built with Cursor/i, /Made with Cursor/i],
        },
        confidence: 90,
    },
    {
        name: 'Windsurf',
        category: 'ai-generated',
        url: 'https://codeium.com/windsurf',
        isSignal: true,
        patterns: {
            meta: [{ name: 'generator', content: /windsurf/i }, { name: 'generator', content: /codeium/i }],
            html: [/Built with Windsurf/i],
        },
        confidence: 90,
    },
    {
        name: 'Devin',
        category: 'ai-generated',
        url: 'https://devin.ai',
        isSignal: true,
        patterns: {
            meta: [{ name: 'generator', content: /devin/i }],
            html: [/Built by Devin/i],
        },
        confidence: 90,
    },
    {
        name: 'Claude Artifacts',
        category: 'ai-generated',
        url: 'https://claude.ai',
        isSignal: true,
        patterns: {
            // Claude artifacts are only on artifact pages, not the main site
            url: [/claude\.ai\/.*artifact/i, /artifact.*claude/i],
            html: [/<title[^>]*>.*Claude Artifact/i, /Claude Artifact.*<\/title>/i],
            meta: [{ name: 'generator', content: /^claude.*artifact/i }],
        },
        confidence: 90,
    },
    {
        name: 'GPT Engineer',
        category: 'ai-generated',
        url: 'https://gptengineer.app',
        isSignal: true,
        patterns: {
            scripts: [/gptengineer/],
            meta: [{ name: 'generator', content: /gpt-?engineer/i }],
            html: [/GPT Engineer/i],
        },
        confidence: 90,
        implies: ['React', 'Tailwind CSS'],
    },
    {
        name: 'Durable',
        category: 'ai-generated',
        url: 'https://durable.co',
        isSignal: true,
        patterns: {
            url: [/\.durable\.co$/],
            scripts: [/durable\.co/],
            meta: [{ name: 'generator', content: /durable/i }],
        },
        confidence: 100,
    },
    {
        name: 'Hostinger AI',
        category: 'ai-generated',
        url: 'https://hostinger.com',
        isSignal: false,
        patterns: {
            meta: [{ name: 'generator', content: /hostinger.*ai/i }],
            scripts: [/hostinger/],
        },
        confidence: 90,
    },
    {
        name: 'Mixo',
        category: 'ai-generated',
        url: 'https://mixo.io',
        isSignal: true,
        patterns: {
            url: [/\.mixo\.io$/],
            scripts: [/mixo\.io/],
            meta: [{ name: 'generator', content: /mixo/i }],
        },
        confidence: 100,
    },
    {
        name: '10Web AI',
        category: 'ai-generated',
        url: 'https://10web.io',
        isSignal: false,
        patterns: {
            scripts: [/10web/],
            meta: [{ name: 'generator', content: /10web/i }],
        },
        confidence: 90,
        implies: ['WordPress'],
    },
    {
        name: 'Relume',
        category: 'ai-generated',
        url: 'https://relume.io',
        isSignal: true,
        patterns: {
            scripts: [/relume/],
            meta: [{ name: 'generator', content: /relume/i }],
            dom: ['[data-relume]'],
        },
        confidence: 90,
    },
    {
        name: 'Teleporthq',
        category: 'ai-generated',
        url: 'https://teleporthq.io',
        isSignal: true,
        patterns: {
            url: [/\.teleporthq\.app$/],
            scripts: [/teleporthq/],
            meta: [{ name: 'generator', content: /teleporthq/i }],
        },
        confidence: 100,
    },
    {
        name: 'Builder.io',
        category: 'ai-generated',
        url: 'https://builder.io',
        isSignal: true,
        patterns: {
            scripts: [/builder\.io/, /cdn\.builder\.io/],
            globals: ['Builder', 'builderWC'],
            dom: ['builder-component', '[builder-id]'],
        },
        confidence: 100,
    },

    // ==================== MORE AI BUILDERS & NO-CODE ====================
    {
        name: 'Magic Patterns',
        category: 'ai-generated',
        url: 'https://magicpatterns.com',
        isSignal: true,
        patterns: {
            url: [/\.magicpatterns\.com$/, /magicpatterns\.com/],
            scripts: [/magicpatterns/i],
            meta: [{ name: 'generator', content: /magic\s?patterns/i }],
            html: [/Magic Patterns/i, /magicpatterns/i],
        },
        confidence: 100,
        implies: ['React', 'Tailwind CSS'],
    },
    {
        name: 'Base44',
        category: 'ai-generated',
        url: 'https://base44.com',
        isSignal: true,
        patterns: {
            url: [/\.base44\.com$/, /base44\.com/],
            scripts: [/base44/i],
            meta: [{ name: 'generator', content: /base44/i }],
            html: [/base44/i],
        },
        confidence: 100,
    },
    {
        name: 'Wix ADI',
        category: 'ai-generated',
        url: 'https://wix.com/adi',
        isSignal: false,
        patterns: {
            meta: [{ name: 'generator', content: /Wix.*ADI/i }],
            html: [/wix-adi/i],
        },
        confidence: 90,
        requires: ['Wix'],
    },
    {
        name: 'Jimdo',
        category: 'ai-generated',
        url: 'https://jimdo.com',
        isSignal: false,
        patterns: {
            url: [/\.jimdosite\.com$/, /\.jimdo\.com$/],
            scripts: [/jimdo/i],
            meta: [{ name: 'generator', content: /jimdo/i }],
        },
        confidence: 100,
    },
    {
        name: 'Hocoos',
        category: 'ai-generated',
        url: 'https://hocoos.com',
        isSignal: true,
        patterns: {
            url: [/\.hocoos\.com$/],
            scripts: [/hocoos/i],
            meta: [{ name: 'generator', content: /hocoos/i }],
        },
        confidence: 100,
    },
    {
        name: 'Dora AI',
        category: 'ai-generated',
        url: 'https://dora.run',
        isSignal: true,
        patterns: {
            url: [/\.dora\.run$/],
            scripts: [/dora\.run/],
            meta: [{ name: 'generator', content: /dora/i }],
            globals: ['__DORA__'],
        },
        confidence: 100,
    },
    {
        name: 'Uizard',
        category: 'ai-generated',
        url: 'https://uizard.io',
        isSignal: true,
        patterns: {
            scripts: [/uizard/i],
            meta: [{ name: 'generator', content: /uizard/i }],
        },
        confidence: 100,
    },
    {
        name: 'Framer AI',
        category: 'ai-generated',
        url: 'https://framer.com',
        isSignal: true,
        patterns: {
            // Framer with AI-specific features
            dom: ['[data-framer-generated]', '[data-framer-ai]'],
            html: [/framer-ai/i, /generated.*framer/i],
        },
        confidence: 85,
        requires: ['Framer'],
    },
    {
        name: 'Wegic',
        category: 'ai-generated',
        url: 'https://wegic.ai',
        isSignal: true,
        patterns: {
            url: [/\.wegic\.ai$/],
            scripts: [/wegic/i],
            meta: [{ name: 'generator', content: /wegic/i }],
        },
        confidence: 100,
    },
    {
        name: 'Canva Websites',
        category: 'ai-generated',
        url: 'https://canva.com',
        isSignal: false,
        patterns: {
            // Require URL pattern OR meta tag - script mentions alone are not enough
            url: [/\.canva\.site$/, /my\.canva\.site/],
            meta: [{ name: 'generator', content: /canva/i }],
        },
        confidence: 100,
    },
    {
        name: 'Tilda',
        category: 'site-builder',
        url: 'https://tilda.cc',
        isSignal: false,
        patterns: {
            url: [/\.tilda\.ws$/],
            scripts: [/tilda\.cc/, /tilda\.ws/],
            meta: [{ name: 'generator', content: /tilda/i }],
            dom: ['[class*="t-rec"]', '[class*="t-cover"]'],
        },
        confidence: 100,
    },
    {
        name: 'Softr',
        category: 'ai-generated',
        url: 'https://softr.io',
        isSignal: true,
        patterns: {
            url: [/\.softr\.app$/],
            scripts: [/softr\.io/],
            meta: [{ name: 'generator', content: /softr/i }],
            globals: ['Softr'],
        },
        confidence: 100,
    },
    {
        name: 'Typedream',
        category: 'ai-generated',
        url: 'https://typedream.com',
        isSignal: true,
        patterns: {
            url: [/\.typedream\.app$/],
            scripts: [/typedream/i],
            meta: [{ name: 'generator', content: /typedream/i }],
        },
        confidence: 100,
    },
    {
        name: 'Unicorn Platform',
        category: 'ai-generated',
        url: 'https://unicornplatform.com',
        isSignal: true,
        patterns: {
            url: [/\.unicornplatform\.page$/],
            scripts: [/unicornplatform/i],
            meta: [{ name: 'generator', content: /unicorn\s?platform/i }],
        },
        confidence: 100,
    },
    {
        name: 'Unbounce',
        category: 'ai-generated',
        url: 'https://unbounce.com',
        isSignal: false,
        patterns: {
            url: [/\.unbounce\.com$/],
            scripts: [/unbounce/i],
            meta: [{ name: 'generator', content: /unbounce/i }],
            globals: ['ub'],
        },
        confidence: 100,
    },
    {
        name: 'Leadpages',
        category: 'ai-generated',
        url: 'https://leadpages.com',
        isSignal: false,
        patterns: {
            url: [/\.leadpages\.co$/, /\.lpages\.co$/],
            scripts: [/leadpages/i],
            meta: [{ name: 'generator', content: /leadpages/i }],
        },
        confidence: 100,
    },
    {
        name: 'Instapage',
        category: 'ai-generated',
        url: 'https://instapage.com',
        isSignal: false,
        patterns: {
            url: [/\.instapage\.com$/],
            scripts: [/instapage/i],
            meta: [{ name: 'generator', content: /instapage/i }],
            globals: ['Instapage'],
        },
        confidence: 100,
    },
    {
        name: 'Brizy',
        category: 'ai-generated',
        url: 'https://brizy.io',
        isSignal: true,
        patterns: {
            scripts: [/brizy/i],
            meta: [{ name: 'generator', content: /brizy/i }],
            dom: ['[class*="brz-"]'],
        },
        confidence: 100,
    },
    {
        name: 'Elementor AI',
        category: 'ai-generated',
        url: 'https://elementor.com',
        isSignal: false,
        patterns: {
            dom: ['[data-elementor-ai]', '[class*="elementor-ai"]'],
            html: [/elementor-ai/i],
        },
        confidence: 85,
        requires: ['Elementor'],
    },
    {
        name: 'Elementor',
        category: 'site-builder',
        url: 'https://elementor.com',
        isSignal: false,
        patterns: {
            dom: ['[class*="elementor-"]', '[data-elementor-type]'],
            meta: [{ name: 'generator', content: /elementor/i }],
        },
        confidence: 100,
        implies: ['WordPress'],
    },
    {
        name: 'Divi',
        category: 'site-builder',
        url: 'https://elegantthemes.com/gallery/divi',
        isSignal: false,
        patterns: {
            dom: ['#et-main-area', '[class*="et_pb_"][class*="et_pb_section"]'],
            scripts: [/divi.*\.js/i, /\/wp-content\/themes\/Divi/],
        },
        confidence: 85,
        requires: ['WordPress'],
    },
    {
        name: 'Divi AI',
        category: 'ai-generated',
        url: 'https://elegantthemes.com/divi-ai',
        isSignal: false,
        patterns: {
            html: [/divi-ai/i, /et-ai-generated/i],
        },
        confidence: 85,
        requires: ['Divi'],
    },
    {
        name: 'Super.so',
        category: 'ai-generated',
        url: 'https://super.so',
        isSignal: true,
        patterns: {
            url: [/\.super\.site$/],
            scripts: [/super\.so/],
            meta: [{ name: 'generator', content: /super\.so/i }],
            html: [/Powered by Super/i],
        },
        confidence: 100,
        implies: ['Notion'],
    },
    {
        name: 'Potion',
        category: 'ai-generated',
        url: 'https://potion.so',
        isSignal: true,
        patterns: {
            url: [/\.potion\.so$/],
            scripts: [/potion\.so/],
            meta: [{ name: 'generator', content: /potion/i }],
        },
        confidence: 100,
        implies: ['Notion'],
    },
    {
        name: 'Notion Sites',
        category: 'site-builder',
        url: 'https://notion.so',
        isSignal: false,
        patterns: {
            url: [/\.notion\.site$/],
            globals: ['__NOTION__'],
            scripts: [/notion\.so/],
        },
        confidence: 100,
    },
    {
        name: 'Notion',
        category: 'site-builder',
        url: 'https://notion.so',
        isSignal: false,
        patterns: {
            globals: ['__NOTION_RENDERER__'],
            dom: ['[class*="notion-"]'],
        },
        confidence: 100,
    },
    {
        name: 'Pico',
        category: 'ai-generated',
        url: 'https://picoapps.xyz',
        isSignal: true,
        patterns: {
            url: [/\.picoapps\.xyz$/, /pico-apps\.xyz/],
            meta: [{ name: 'generator', content: /pico/i }],
        },
        confidence: 100,
    },
    {
        name: 'Makeswift',
        category: 'ai-generated',
        url: 'https://makeswift.com',
        isSignal: true,
        patterns: {
            scripts: [/makeswift/i],
            dom: ['[data-makeswift]'],
        },
        confidence: 100,
    },
    {
        name: 'Plasmic',
        category: 'ai-generated',
        url: 'https://plasmic.app',
        isSignal: true,
        patterns: {
            scripts: [/plasmic/i],
            globals: ['__PLASMIC__', 'plasmic'],
            dom: ['[class*="plasmic"]'],
        },
        confidence: 100,
    },
    {
        name: 'Visual Copilot',
        category: 'ai-generated',
        url: 'https://builder.io/visual-copilot',
        isSignal: true,
        patterns: {
            html: [/visual-copilot/i, /Visual Copilot/i],
            meta: [{ name: 'generator', content: /visual.?copilot/i }],
        },
        confidence: 90,
    },
    {
        name: 'Locofy',
        category: 'ai-generated',
        url: 'https://locofy.ai',
        isSignal: true,
        patterns: {
            scripts: [/locofy/i],
            meta: [{ name: 'generator', content: /locofy/i }],
            html: [/locofy/i],
        },
        confidence: 100,
    },
    {
        name: 'Anima',
        category: 'ai-generated',
        url: 'https://animaapp.com',
        isSignal: true,
        patterns: {
            scripts: [/animaapp/i, /anima-app/i],
            meta: [{ name: 'generator', content: /anima/i }],
        },
        confidence: 100,
    },
    {
        name: 'TeleportHQ',
        category: 'ai-generated',
        url: 'https://teleporthq.io',
        isSignal: true,
        patterns: {
            scripts: [/teleporthq/i],
            meta: [{ name: 'generator', content: /teleport/i }],
        },
        confidence: 100,
    },
    {
        name: 'Screenshot to Code',
        category: 'ai-generated',
        url: 'https://screenshottocode.com',
        isSignal: true,
        patterns: {
            html: [/screenshot.?to.?code/i],
            meta: [{ name: 'generator', content: /screenshot.?to.?code/i }],
        },
        confidence: 90,
    },
    {
        name: 'Vercel Ship',
        category: 'ai-generated',
        url: 'https://vercel.com',
        isSignal: true,
        patterns: {
            html: [/vercel ship/i, /shipped with vercel/i],
        },
        confidence: 80,
        requires: ['Vercel'],
    },
    {
        name: 'Tempo Labs',
        category: 'ai-generated',
        url: 'https://tempolabs.ai',
        isSignal: true,
        patterns: {
            url: [/\.tempolabs\.ai$/],
            scripts: [/tempolabs/i],
            meta: [{ name: 'generator', content: /tempo/i }],
        },
        confidence: 100,
    },
    {
        name: 'Ziply',
        category: 'ai-generated',
        url: 'https://ziply.ai',
        isSignal: true,
        patterns: {
            url: [/\.ziply\.ai$/],
            scripts: [/ziply/i],
        },
        confidence: 100,
    },
    {
        name: 'Kombai',
        category: 'ai-generated',
        url: 'https://kombai.com',
        isSignal: true,
        patterns: {
            scripts: [/kombai/i],
            meta: [{ name: 'generator', content: /kombai/i }],
        },
        confidence: 100,
    },
    {
        name: 'Webstudio',
        category: 'ai-generated',
        url: 'https://webstudio.is',
        isSignal: true,
        patterns: {
            url: [/\.wstd\.io$/],
            scripts: [/webstudio/i],
            meta: [{ name: 'generator', content: /webstudio/i }],
            globals: ['__webstudio__'],
        },
        confidence: 100,
    },
    {
        name: 'Fable',
        category: 'ai-generated',
        url: 'https://sharefable.com',
        isSignal: true,
        patterns: {
            url: [/\.sharefable\.com$/],
            scripts: [/fable/i],
        },
        confidence: 100,
    },
    {
        name: 'Gamma',
        category: 'ai-generated',
        url: 'https://gamma.app',
        isSignal: true,
        patterns: {
            url: [/\.gamma\.app$/],
            scripts: [/gamma\.app/],
            meta: [{ name: 'generator', content: /gamma/i }],
        },
        confidence: 100,
    },
    {
        name: 'Tome',
        category: 'ai-generated',
        url: 'https://tome.app',
        isSignal: true,
        patterns: {
            url: [/\.tome\.app$/],
            scripts: [/tome\.app/],
        },
        confidence: 100,
    },
    {
        name: 'Beautiful.ai',
        category: 'ai-generated',
        url: 'https://beautiful.ai',
        isSignal: true,
        patterns: {
            url: [/\.beautiful\.ai$/],
            scripts: [/beautiful\.ai/],
        },
        confidence: 100,
    },
    {
        name: 'GitLab Pages',
        category: 'ai-generated',
        url: 'https://about.gitlab.com/stages-devops-lifecycle/pages/',
        isSignal: false,
        patterns: {
            url: [/\.gitlab\.io$/],
            headers: [{ name: 'x-gitlab-static' }],
        },
        confidence: 100,
    },
    {
        name: 'Bitbucket Pages',
        category: 'paas',
        url: 'https://support.atlassian.com/bitbucket-cloud/',
        isSignal: false,
        patterns: {
            url: [/\.bitbucket\.io$/],
        },
        confidence: 100,
    },
    {
        name: 'Appy Pie',
        category: 'ai-generated',
        url: 'https://appypie.com',
        isSignal: false,
        patterns: {
            url: [/\.appypie\.com$/],
            scripts: [/appypie/i],
            meta: [{ name: 'generator', content: /appy\s?pie/i }],
        },
        confidence: 100,
    },
    {
        name: 'Pineapple AI',
        category: 'ai-generated',
        url: 'https://pineapplebuilder.com',
        isSignal: true,
        patterns: {
            url: [/\.pineapplebuilder\.com$/],
            scripts: [/pineapplebuilder/i],
        },
        confidence: 100,
    },
    {
        name: 'Linkfolio',
        category: 'ai-generated',
        url: 'https://linkfolio.me',
        isSignal: true,
        patterns: {
            url: [/\.linkfolio\.me$/],
            scripts: [/linkfolio/i],
        },
        confidence: 100,
    },
    {
        name: 'Bio Link',
        category: 'site-builder',
        url: 'https://bio.link',
        isSignal: false,
        patterns: {
            url: [/\.bio\.link$/],
        },
        confidence: 100,
    },
    {
        name: 'Linktree',
        category: 'site-builder',
        url: 'https://linktr.ee',
        isSignal: false,
        patterns: {
            url: [/linktr\.ee\//],
            scripts: [/linktr\.ee/],
        },
        confidence: 100,
    },
    {
        name: 'Stan Store',
        category: 'ecommerce',
        url: 'https://stan.store',
        isSignal: true,
        patterns: {
            url: [/\.stan\.store$/],
            scripts: [/stan\.store/],
        },
        confidence: 100,
    },
    {
        name: 'Gumroad',
        category: 'ecommerce',
        url: 'https://gumroad.com',
        isSignal: false,
        patterns: {
            url: [/\.gumroad\.com$/],
            scripts: [/gumroad/i],
        },
        confidence: 100,
    },
    {
        name: 'Replo',
        category: 'ai-generated',
        url: 'https://replo.app',
        isSignal: true,
        patterns: {
            scripts: [/replo\.app/],
            meta: [{ name: 'generator', content: /replo/i }],
            dom: ['[data-replo]'],
        },
        confidence: 100,
        implies: ['Shopify'],
    },
    {
        name: 'Shogun',
        category: 'ai-generated',
        url: 'https://getshogun.com',
        isSignal: false,
        patterns: {
            scripts: [/shogun/i],
            dom: ['[class*="shogun-"]'],
        },
        confidence: 100,
    },
    {
        name: 'PageFly',
        category: 'ai-generated',
        url: 'https://pagefly.io',
        isSignal: false,
        patterns: {
            scripts: [/pagefly/i],
            dom: ['[class*="pagefly"]'],
        },
        confidence: 100,
        implies: ['Shopify'],
    },
    {
        name: 'GemPages',
        category: 'ai-generated',
        url: 'https://gempages.net',
        isSignal: false,
        patterns: {
            scripts: [/gempages/i],
            dom: ['[class*="gempages"]'],
        },
        confidence: 100,
        implies: ['Shopify'],
    },
    {
        name: 'Landen',
        category: 'ai-generated',
        url: 'https://landen.co',
        isSignal: true,
        patterns: {
            url: [/\.landen\.co$/],
            scripts: [/landen/i],
            meta: [{ name: 'generator', content: /landen/i }],
        },
        confidence: 100,
    },
    {
        name: 'Sheet2Site',
        category: 'ai-generated',
        url: 'https://sheet2site.com',
        isSignal: true,
        patterns: {
            scripts: [/sheet2site/i],
            meta: [{ name: 'generator', content: /sheet2site/i }],
        },
        confidence: 100,
    },
    {
        name: 'Spreadsheet Web',
        category: 'ai-generated',
        url: 'https://spreadsheetweb.com',
        isSignal: true,
        patterns: {
            scripts: [/spreadsheetweb/i],
        },
        confidence: 100,
    },
    {
        name: 'Observable',
        category: 'dataviz',
        url: 'https://observablehq.com',
        isSignal: true,
        patterns: {
            url: [/\.observablehq\.com$/],
            scripts: [/observablehq\.com/, /@observablehq/, /observable\.runtime\.js/],
        },
        confidence: 100,
    },
    {
        name: 'Val Town',
        category: 'ai-generated',
        url: 'https://val.town',
        isSignal: true,
        patterns: {
            url: [/\.val\.town$/, /val\.town/],
            scripts: [/val\.town/],
        },
        confidence: 100,
    },
    {
        name: 'Hugging Face Spaces',
        category: 'ai-generated',
        url: 'https://huggingface.co/spaces',
        isSignal: true,
        patterns: {
            url: [/\.hf\.space$/, /huggingface\.co\/spaces/],
            scripts: [/huggingface/i],
        },
        confidence: 100,
    },
    {
        name: 'Gradio',
        category: 'ai-generated',
        url: 'https://gradio.app',
        isSignal: true,
        patterns: {
            scripts: [/gradio/i],
            globals: ['gradio_config'],
            dom: ['gradio-app', '[class*="gradio"]'],
        },
        confidence: 100,
    },
    {
        name: 'Streamlit',
        category: 'ai-generated',
        url: 'https://streamlit.io',
        isSignal: true,
        patterns: {
            url: [/\.streamlit\.app$/, /\.streamlitapp\.com$/],
            scripts: [/streamlit/i],
            globals: ['streamlit'],
            dom: ['[class*="stApp"]'],
        },
        confidence: 100,
    },
    {
        name: 'Dash',
        category: 'ai-generated',
        url: 'https://dash.plotly.com',
        isSignal: true,
        patterns: {
            globals: ['dash_clientside'],
            scripts: [/dash.*plotly/, /plotly.*dash/, /\/_dash/],
        },
        confidence: 100,
    },
    {
        name: 'Anvil',
        category: 'ai-generated',
        url: 'https://anvil.works',
        isSignal: true,
        patterns: {
            url: [/\.anvil\.app$/],
            scripts: [/anvil/i],
            globals: ['anvilAppMainPackage'],
        },
        confidence: 100,
    },
    {
        name: 'Retool',
        category: 'ai-generated',
        url: 'https://retool.com',
        isSignal: true,
        patterns: {
            scripts: [/retool/i],
            globals: ['Retool'],
            dom: ['[class*="retool"]'],
        },
        confidence: 100,
    },
    {
        name: 'Appsmith',
        category: 'ai-generated',
        url: 'https://appsmith.com',
        isSignal: true,
        patterns: {
            scripts: [/appsmith/i],
            globals: ['appsmith'],
        },
        confidence: 100,
    },
    {
        name: 'Tooljet',
        category: 'ai-generated',
        url: 'https://tooljet.com',
        isSignal: true,
        patterns: {
            scripts: [/tooljet/i],
        },
        confidence: 100,
    },
    {
        name: 'n8n',
        category: 'ai-generated',
        url: 'https://n8n.io',
        isSignal: true,
        patterns: {
            scripts: [/n8n/i],
            globals: ['n8n'],
        },
        confidence: 100,
    },
    {
        name: 'Windmill',
        category: 'ai-generated',
        url: 'https://windmill.dev',
        isSignal: true,
        patterns: {
            scripts: [/windmill\.dev/],
        },
        confidence: 100,
    },
];
