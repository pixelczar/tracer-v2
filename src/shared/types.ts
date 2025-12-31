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
}

export interface FontPreview {
    method: 'google' | 'adobe' | 'datauri' | 'canvas';
    data: string;
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
    | 'js-framework' | 'web-framework' | 'ui-framework' | 'js-library'
    | 'css-framework' | 'css-in-js' | 'font-scripts'
    | 'animation' | 'webgl' | 'shaders'
    | 'cdn' | 'paas' | 'iaas' | 'web-server'
    | 'analytics' | 'issue-tracker' | 'feature-mgmt' | 'performance'
    | 'advertising' | 'crm' | 'live-chat' | 'payment' | 'customer-data'
    | 'cms' | 'static-gen' | 'documentation'
    | 'security' | 'auth'
    | 'pwa' | 'programming-lang' | 'miscellaneous';

export const TECH_CATEGORY_META: Record<TechCategory, { label: string; group: string }> = {
    'js-framework': { label: 'JS Framework', group: 'Frontend' },
    'web-framework': { label: 'Framework', group: 'Frontend' },
    'ui-framework': { label: 'UI', group: 'Frontend' },
    'js-library': { label: 'Library', group: 'Frontend' },
    'css-framework': { label: 'CSS', group: 'Styling' },
    'css-in-js': { label: 'CSS-in-JS', group: 'Styling' },
    'font-scripts': { label: 'Fonts', group: 'Styling' },
    'animation': { label: 'Animation', group: 'Graphics' },
    'webgl': { label: 'WebGL', group: 'Graphics' },
    'shaders': { label: 'Shaders', group: 'Graphics' },
    'cdn': { label: 'CDN', group: 'Infra' },
    'paas': { label: 'PaaS', group: 'Infra' },
    'iaas': { label: 'IaaS', group: 'Infra' },
    'web-server': { label: 'Server', group: 'Infra' },
    'analytics': { label: 'Analytics', group: 'Analytics' },
    'issue-tracker': { label: 'Issues', group: 'Analytics' },
    'feature-mgmt': { label: 'Features', group: 'Analytics' },
    'performance': { label: 'Perf', group: 'Analytics' },
    'advertising': { label: 'Ads', group: 'Marketing' },
    'crm': { label: 'CRM', group: 'Marketing' },
    'live-chat': { label: 'Chat', group: 'Marketing' },
    'payment': { label: 'Payment', group: 'Marketing' },
    'customer-data': { label: 'CDP', group: 'Marketing' },
    'cms': { label: 'CMS', group: 'Content' },
    'static-gen': { label: 'Static', group: 'Content' },
    'documentation': { label: 'Docs', group: 'Content' },
    'security': { label: 'Security', group: 'Security' },
    'auth': { label: 'Auth', group: 'Security' },
    'pwa': { label: 'PWA', group: 'Misc' },
    'programming-lang': { label: 'Language', group: 'Misc' },
    'miscellaneous': { label: 'Misc', group: 'Misc' },
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
