export interface ScanResult {
    id: string;
    url: string;
    domain: string;
    favicon?: string;
    ogImage?: string;
    scannedAt: number;
    colors: ColorInfo[];
    fonts: FontInfo[];
    tech: TechInfo[];
    inspectedElements: InspectedElement[];
}

export interface ColorInfo {
    hex: string;
    weight: number; // 1-3, determines grid size
    source: 'css' | 'computed' | 'image';
}

export interface FontInfo {
    family: string;
    weights: string[];
    styles: ('normal' | 'italic')[];
    letterSpacing: string[];
    lineHeight: string[];
    sizes: string[];
    source: 'google' | 'adobe' | 'custom' | 'system';
    url?: string;
    preview: FontPreview;
    isIconFont?: boolean;
    iconSamples?: string[]; // Icon characters extracted from the page
}

export interface FontPreview {
    method: 'google' | 'adobe' | 'datauri' | 'canvas';
    data: string;
    previews?: string[]; // Multiple data URIs for cycling
    weightPreviews?: Record<string, string[]>; // weight -> cycling previews
}

export interface TechInfo {
    name: string;
    version?: string;
    confidence: number; // 0-100, show "50% sure" badge if < 80
    category: TechCategory;
    isSignal: boolean; // cutting-edge / design-forward
    url: string;
    icon?: string;
}

export type TechCategory =
    // Frontend
    | 'js-framework' | 'web-framework' | 'ui-framework' | 'js-library'
    // Styling
    | 'css-framework' | 'css-in-js' | 'css-methodology' | 'font-service' | 'font-tech'
    // Graphics & Animation
    | 'animation' | 'webgl' | 'shaders' | 'canvas' | 'svg' | 'dataviz'
    // Content & CMS
    | 'cms' | 'ecommerce' | 'site-builder' | 'static-gen' | 'documentation' | 'blog'
    // Analytics & Marketing
    | 'analytics' | 'heatmaps' | 'ab-testing' | 'customer-data' | 'tag-manager'
    | 'marketing-automation' | 'live-chat' | 'popup' | 'social-proof' | 'scheduling'
    // Commerce & Payments
    | 'payment' | 'subscription'
    // Infrastructure & Performance
    | 'cdn' | 'paas' | 'backend-service' | 'database' | 'serverless'
    | 'image-cdn' | 'video' | 'performance' | 'rum' | 'error-tracking'
    // Security & Authentication
    | 'security' | 'auth' | 'consent'
    // Developer Tools
    | 'programming-lang' | 'build-tool' | 'testing' | 'devtools' | 'ai-tools'
    // Rich Content & Media
    | 'forms' | 'rich-text' | 'code-display' | 'markdown' | 'maps' | 'audio' | 'notifications'
    // Miscellaneous
    | 'pwa' | 'accessibility' | 'i18n' | 'seo' | 'social' | 'realtime' | 'search' | 'feedback' | 'collaboration' | 'misc'
    // AI Generated
    | 'ai-generated';

export const TECH_CATEGORY_META: Record<TechCategory, { label: string; group: string }> = {
    // Frontend
    'js-framework': { label: 'JS Framework', group: 'Frontend' },
    'web-framework': { label: 'Meta Framework', group: 'Frontend' },
    'ui-framework': { label: 'Component Library', group: 'Frontend' },
    'js-library': { label: 'Library', group: 'Frontend' },
    // Styling
    'css-framework': { label: 'CSS Framework', group: 'Styling' },
    'css-in-js': { label: 'CSS-in-JS', group: 'Styling' },
    'css-methodology': { label: 'CSS Architecture', group: 'Styling' },
    'font-service': { label: 'Font Service', group: 'Styling' },
    'font-tech': { label: 'Font Tech', group: 'Styling' },
    // Graphics & Animation
    'animation': { label: 'Animation', group: 'Graphics' },
    'webgl': { label: 'WebGL / 3D', group: 'Graphics' },
    'shaders': { label: 'Shaders', group: 'Graphics' },
    'canvas': { label: 'Canvas 2D', group: 'Graphics' },
    'svg': { label: 'SVG', group: 'Graphics' },
    'dataviz': { label: 'Data Viz', group: 'Graphics' },
    // Content & CMS
    'cms': { label: 'CMS', group: 'Content' },
    'ecommerce': { label: 'E-commerce', group: 'Content' },
    'site-builder': { label: 'Site Builder', group: 'Content' },
    'static-gen': { label: 'Static Gen', group: 'Content' },
    'documentation': { label: 'Docs', group: 'Content' },
    'blog': { label: 'Blog', group: 'Content' },
    // Analytics & Marketing
    'analytics': { label: 'Analytics', group: 'Analytics' },
    'heatmaps': { label: 'Heatmaps', group: 'Analytics' },
    'ab-testing': { label: 'A/B Testing', group: 'Analytics' },
    'customer-data': { label: 'CDP', group: 'Analytics' },
    'tag-manager': { label: 'Tag Manager', group: 'Analytics' },
    'marketing-automation': { label: 'Marketing', group: 'Marketing' },
    'live-chat': { label: 'Live Chat', group: 'Marketing' },
    'popup': { label: 'Popups', group: 'Marketing' },
    'social-proof': { label: 'Social Proof', group: 'Marketing' },
    'scheduling': { label: 'Scheduling', group: 'Marketing' },
    // Commerce & Payments
    'payment': { label: 'Payment', group: 'Commerce' },
    'subscription': { label: 'Subscription', group: 'Commerce' },
    // Infrastructure & Performance
    'cdn': { label: 'CDN', group: 'Infra' },
    'paas': { label: 'Hosting', group: 'Infra' },
    'backend-service': { label: 'Backend', group: 'Infra' },
    'database': { label: 'Database', group: 'Infra' },
    'serverless': { label: 'Serverless', group: 'Infra' },
    'image-cdn': { label: 'Image CDN', group: 'Infra' },
    'video': { label: 'Video', group: 'Infra' },
    'performance': { label: 'Performance', group: 'Infra' },
    'rum': { label: 'RUM', group: 'Infra' },
    'error-tracking': { label: 'Errors', group: 'Infra' },
    // Security & Authentication
    'security': { label: 'Security', group: 'Security' },
    'auth': { label: 'Auth', group: 'Security' },
    'consent': { label: 'Consent', group: 'Security' },
    // Developer Tools
    'programming-lang': { label: 'Language', group: 'Developer' },
    'build-tool': { label: 'Build Tool', group: 'Developer' },
    'testing': { label: 'Testing', group: 'Developer' },
    'devtools': { label: 'DevTools', group: 'Developer' },
    'ai-tools': { label: 'AI', group: 'Developer' },
    // Rich Content & Media
    'forms': { label: 'Forms', group: 'Content' },
    'rich-text': { label: 'Rich Text', group: 'Content' },
    'code-display': { label: 'Code', group: 'Content' },
    'markdown': { label: 'Markdown', group: 'Content' },
    'maps': { label: 'Maps', group: 'Content' },
    'audio': { label: 'Audio', group: 'Content' },
    'notifications': { label: 'Push', group: 'Content' },
    // Miscellaneous
    'pwa': { label: 'PWA', group: 'Misc' },
    'accessibility': { label: 'A11y', group: 'Misc' },
    'i18n': { label: 'i18n', group: 'Misc' },
    'seo': { label: 'SEO', group: 'Misc' },
    'social': { label: 'Social', group: 'Misc' },
    'realtime': { label: 'Realtime', group: 'Misc' },
    'search': { label: 'Search', group: 'Misc' },
    'feedback': { label: 'Feedback', group: 'Misc' },
    'collaboration': { label: 'Collab', group: 'Misc' },
    'misc': { label: 'Other', group: 'Misc' },
    // AI Generated
    'ai-generated': { label: 'AI Built', group: 'AI' },
};

export interface InspectedElement {
    id: string;
    screenshot: string;
    selector: string;
    tagName: string;
    rect: { top: number; left: number; width: number; height: number };
    attributes: Record<string, string>;
    tech: TechInfo[];
    styles: {
        animations: string[];
        transforms: string[];
        filters: string[];
        blendModes: string[];
    };
    inspectedAt: number;
}

export type ScanState = 'idle' | 'scanning' | 'processing' | 'complete' | 'error';
export type InspectState = 'idle' | 'selecting' | 'analyzing' | 'complete';

export interface PanelMessage {
    type: 'START_SCAN' | 'SCAN_PROGRESS' | 'SCAN_COMPLETE' | 'SCAN_ERROR' |
    'START_INSPECT' | 'INSPECT_HOVER' | 'INSPECT_SELECT' | 'INSPECT_COMPLETE' | 'CANCEL_INSPECT';
    payload?: unknown;
}

export interface ContentMessage {
    type: 'EXTRACT' | 'ENTER_INSPECT_MODE' | 'EXIT_INSPECT_MODE';
}
