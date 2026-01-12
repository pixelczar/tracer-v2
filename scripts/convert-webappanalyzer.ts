/**
 * Conversion script for webappanalyzer -> tracer-v2 TechPattern format
 * 
 * Usage: npx tsx scripts/convert-webappanalyzer.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES
// ============================================================================

interface WebappanalyzerTech {
    description?: string;
    cats?: number[];
    cookies?: Record<string, string>;
    dom?: string[] | Record<string, { exists?: string; attributes?: Record<string, string>; properties?: Record<string, string>; text?: string }>;
    dns?: Record<string, string[]>;
    icon?: string;
    cpe?: string;
    js?: Record<string, string>;
    excludes?: string[] | string;
    headers?: Record<string, string>;
    text?: string[];
    css?: string[];
    robots?: string[];
    implies?: string[] | string;
    requires?: string[] | string;
    requiresCategory?: number[];
    meta?: Record<string, string>;
    probe?: Record<string, string>;
    scriptSrc?: string[];
    scripts?: string[];
    url?: string[];
    xhr?: string[];
    oss?: boolean;
    saas?: boolean;
    pricing?: string[];
    website?: string;
    html?: string[];
    certIssuer?: string;
}

interface WebappanalyzerCategories {
    [id: string]: {
        name: string;
        priority: number;
        groups?: number[];
    };
}

type TechCategory =
    | 'js-framework' | 'web-framework' | 'ui-framework' | 'js-library'
    | 'css-framework' | 'css-in-js' | 'css-methodology' | 'font-service' | 'font-tech'
    | 'animation' | 'webgl' | 'shaders' | 'canvas' | 'svg' | 'dataviz'
    | 'cms' | 'ecommerce' | 'site-builder' | 'static-gen' | 'documentation' | 'blog'
    | 'analytics' | 'heatmaps' | 'ab-testing' | 'customer-data' | 'tag-manager'
    | 'marketing-automation' | 'live-chat' | 'popup' | 'social-proof' | 'scheduling'
    | 'payment' | 'subscription'
    | 'cdn' | 'paas' | 'backend-service' | 'database' | 'serverless'
    | 'image-cdn' | 'video' | 'performance' | 'rum' | 'error-tracking'
    | 'security' | 'auth' | 'consent'
    | 'programming-lang' | 'build-tool' | 'testing' | 'devtools' | 'ai-tools'
    | 'forms' | 'rich-text' | 'code-display' | 'markdown' | 'maps' | 'audio' | 'notifications'
    | 'pwa' | 'accessibility' | 'i18n' | 'seo' | 'social' | 'realtime' | 'search' | 'feedback' | 'collaboration' | 'misc'
    | 'ai-generated';

interface TechPattern {
    name: string;
    category: TechCategory;
    url: string;
    isSignal: boolean;
    patterns: {
        scripts?: string[];
        globals?: string[];
        meta?: { name: string; content?: string }[];
        headers?: { name: string; value?: string }[];
        dom?: string[];
        cookies?: { name: string; value?: string }[];
        css?: string[];
        html?: string[];
        url?: string[];
    };
    confidence?: number;
    versionGlobal?: string;
    implies?: string[];
    excludes?: string[];
    requires?: string[];
}

interface ConversionStats {
    totalTechnologies: number;
    converted: number;
    skippedFeatures: {
        dns: number;
        robots: number;
        probe: number;
        xhr: number;
        certIssuer: number;
    };
    iconsDownloaded: number;
    iconsFailed: string[];
    existingPreserved: number;
}

// ============================================================================
// CATEGORY MAPPING
// ============================================================================

// Webappanalyzer category IDs to our TechCategory
const CATEGORY_MAP: Record<number, TechCategory> = {
    1: 'cms',
    2: 'live-chat',
    3: 'database',
    4: 'documentation',
    5: 'js-framework',
    6: 'ecommerce',
    7: 'image-cdn',
    8: 'video',
    9: 'font-service',
    10: 'js-library',
    11: 'paas',
    12: 'analytics',
    13: 'blog',
    14: 'build-tool',
    15: 'payment',
    16: 'security',
    17: 'cdn',
    18: 'web-framework',
    19: 'misc',
    20: 'seo',
    21: 'ui-framework',
    22: 'programming-lang',
    23: 'devtools',
    24: 'performance',
    25: 'tag-manager',
    26: 'realtime',
    27: 'security',
    28: 'marketing-automation',
    29: 'marketing-automation',
    30: 'marketing-automation',
    31: 'marketing-automation',
    32: 'marketing-automation',
    33: 'marketing-automation',
    34: 'customer-data',
    35: 'tag-manager',
    36: 'heatmaps',
    37: 'consent',
    38: 'ab-testing',
    39: 'popup',
    40: 'social-proof',
    41: 'auth',
    42: 'accessibility',
    43: 'feedback',
    44: 'subscription',
    45: 'forms',
    46: 'rich-text',
    47: 'code-display',
    48: 'maps',
    49: 'search',
    50: 'error-tracking',
    51: 'notifications',
    52: 'rum',
    53: 'i18n',
    54: 'pwa',
    55: 'audio',
    56: 'scheduling',
    57: 'collaboration',
    58: 'serverless',
    59: 'ai-tools',
    60: 'database',
    61: 'backend-service',
    62: 'paas',
    63: 'cdn',
    64: 'paas',
    65: 'backend-service',
    66: 'misc',
    67: 'site-builder',
    68: 'misc',
    69: 'misc',
    70: 'misc',
    71: 'misc',
    72: 'misc',
    73: 'misc',
    74: 'misc',
    75: 'misc',
    76: 'misc',
    77: 'misc',
    78: 'misc',
    79: 'animation',
    80: 'dataviz',
    81: 'svg',
    82: 'webgl',
    83: 'canvas',
    84: 'css-framework',
    85: 'css-in-js',
    86: 'static-gen',
    87: 'ai-generated',
    88: 'social',
    89: 'database',
    90: 'testing',
    91: 'misc',
    92: 'misc',
    93: 'misc',
    94: 'misc',
    95: 'misc',
    96: 'misc',
    97: 'misc',
    98: 'misc',
    99: 'misc',
    100: 'misc',
    101: 'misc',
    102: 'misc',
    103: 'misc',
    104: 'misc',
    105: 'misc',
    106: 'misc',
    107: 'misc',
    108: 'misc',
    109: 'misc',
    110: 'misc',
};

// Signal categories - technologies in these are considered "cutting edge"
const SIGNAL_CATEGORIES: Set<TechCategory> = new Set([
    'webgl', 'animation', 'ai-tools', 'ai-generated', 'realtime',
]);

// ============================================================================
// UTILITIES
// ============================================================================

function httpsGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; tracer-converter/1.0)',
                'Accept': 'application/json, */*',
            }
        }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return httpsGet(res.headers.location!).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function downloadFile(url: string, destPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(destPath);
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; tracer-converter/1.0)',
            }
        }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                try { fs.unlinkSync(destPath); } catch {}
                downloadFile(res.headers.location!, destPath).then(resolve);
                return;
            }
            if (res.statusCode !== 200) {
                file.close();
                try { fs.unlinkSync(destPath); } catch {}
                resolve(false);
                return;
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
            file.on('error', () => {
                file.close();
                try { fs.unlinkSync(destPath); } catch {}
                resolve(false);
            });
        }).on('error', () => {
            file.close();
            try { fs.unlinkSync(destPath); } catch {}
            resolve(false);
        });
    });
}

// Add delay between downloads to avoid rate limiting
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parsePattern(pattern: string): { regex: string; confidence?: number; version?: string } {
    // Parse webappanalyzer pattern format: "pattern\\;confidence:50\\;version:\\1"
    const parts = pattern.split(/\\;/);
    const result: { regex: string; confidence?: number; version?: string } = {
        regex: parts[0] || ''
    };
    
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('confidence:')) {
            result.confidence = parseInt(part.replace('confidence:', ''), 10);
        } else if (part.startsWith('version:')) {
            result.version = part.replace('version:', '');
        }
    }
    
    return result;
}

function normalizePattern(pattern: string): string {
    // Webappanalyzer patterns sometimes have unnecessary escapes
    // According to spec: "Slashes do not need to be escaped"
    // So \/ in the pattern should just be / before we process it
    
    let normalized = pattern;
    
    // Remove backslash before forward slash (they don't need escaping in webappanalyzer)
    normalized = normalized.replace(/\\\//g, '/');
    
    // Remove inline flags like (?i) - JavaScript doesn't support inline flags
    // The i flag is already added to the regex literal
    normalized = normalized.replace(/\(\?i\)/gi, '');
    normalized = normalized.replace(/\(\?-i\)/gi, '');
    normalized = normalized.replace(/\(\?m\)/gi, '');
    normalized = normalized.replace(/\(\?s\)/gi, '');
    normalized = normalized.replace(/\(\?x\)/gi, '');
    
    return normalized;
}

function escapeRegexForTS(pattern: string): string {
    // First normalize the pattern
    const normalized = normalizePattern(pattern);
    
    // Now escape forward slashes for the JS regex literal delimiter
    return normalized.replace(/\//g, '\\/');
}

function regexToLiteral(pattern: string, flags: string = 'i'): string {
    // Convert a pattern string to a regex literal for TypeScript output
    const escaped = escapeRegexForTS(pattern);
    return `/${escaped}/${flags}`;
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

// ============================================================================
// MAIN CONVERSION
// ============================================================================

async function fetchTechnologies(): Promise<Record<string, WebappanalyzerTech>> {
    const allTech: Record<string, WebappanalyzerTech> = {};
    
    // Technology files are split alphabetically: _.json, a.json, b.json, ... z.json
    const files = ['_', ...Array.from('abcdefghijklmnopqrstuvwxyz')];
    
    console.log('Fetching technology definitions...');
    
    for (const file of files) {
        const url = `https://raw.githubusercontent.com/enthec/webappanalyzer/main/src/technologies/${file}.json`;
        try {
            const data = await httpsGet(url);
            const parsed = JSON.parse(data);
            Object.assign(allTech, parsed);
            console.log(`  ✓ ${file}.json (${Object.keys(parsed).length} technologies)`);
        } catch (e) {
            console.log(`  ✗ ${file}.json (failed: ${(e as Error).message})`);
        }
    }
    
    return allTech;
}

async function fetchCategories(): Promise<WebappanalyzerCategories> {
    console.log('Fetching categories...');
    const url = 'https://raw.githubusercontent.com/enthec/webappanalyzer/main/src/categories.json';
    const data = await httpsGet(url);
    return JSON.parse(data);
}

function convertTechnology(name: string, tech: WebappanalyzerTech, stats: ConversionStats): TechPattern | null {
    // Determine category
    const primaryCat = tech.cats?.[0] || 19; // Default to misc
    const category: TechCategory = CATEGORY_MAP[primaryCat] || 'misc';
    
    // Determine if it's a signal tech
    const isSignal = SIGNAL_CATEGORIES.has(category);
    
    const patterns: TechPattern['patterns'] = {};
    let hasPatterns = false;
    
    // Convert globals (js property)
    if (tech.js) {
        patterns.globals = Object.keys(tech.js);
        hasPatterns = true;
    }
    
    // Convert scriptSrc
    if (tech.scriptSrc) {
        patterns.scripts = tech.scriptSrc.map(s => parsePattern(s).regex);
        hasPatterns = true;
    }
    
    // Convert scripts (inline content matching) - add to scripts array
    if (tech.scripts) {
        const scriptPatterns = tech.scripts.map(s => parsePattern(s).regex);
        patterns.scripts = [...(patterns.scripts || []), ...scriptPatterns];
        hasPatterns = true;
    }
    
    // Convert meta
    if (tech.meta) {
        patterns.meta = Object.entries(tech.meta).map(([name, content]) => {
            const parsed = parsePattern(content);
            return { name, content: parsed.regex || undefined };
        });
        hasPatterns = true;
    }
    
    // Convert headers
    if (tech.headers) {
        patterns.headers = Object.entries(tech.headers).map(([name, value]) => {
            const parsed = parsePattern(value);
            return { name: name.toLowerCase(), value: parsed.regex || undefined };
        });
        hasPatterns = true;
    }
    
    // Convert DOM patterns
    if (tech.dom) {
        let domSelectors: string[] = [];
        if (Array.isArray(tech.dom)) {
            domSelectors = tech.dom;
        } else if (typeof tech.dom === 'string') {
            domSelectors = [tech.dom];
        } else {
            // Object format - flatten to selectors
            domSelectors = Object.keys(tech.dom);
        }
        
        // Filter out invalid/overly-broad selectors
        const invalidSelectors = new Set([
            '*',           // Matches everything
            'body',        // Too generic
            'html',        // Too generic
            'head',        // Too generic
            'div',         // Too generic
            'span',        // Too generic
            'a',           // Too generic
            'p',           // Too generic
            'script',      // Too generic
            'style',       // Too generic
            'link',        // Too generic
            'meta',        // Too generic
            'img',         // Too generic
        ]);
        
        patterns.dom = domSelectors.filter(s => {
            // Skip empty or invalid selectors
            if (!s || typeof s !== 'string') return false;
            // Skip overly broad selectors
            if (invalidSelectors.has(s.toLowerCase().trim())) return false;
            // Skip selectors that are just a tag name (no attributes/classes)
            if (/^[a-z]+$/i.test(s.trim())) return false;
            return true;
        });
        
        if (patterns.dom.length > 0) {
            hasPatterns = true;
        } else {
            delete patterns.dom;
        }
    }
    
    // Convert cookies
    if (tech.cookies) {
        patterns.cookies = Object.entries(tech.cookies).map(([name, value]) => {
            const parsed = parsePattern(value);
            return { name, value: parsed.regex || undefined };
        });
        hasPatterns = true;
    }
    
    // Convert CSS patterns
    if (tech.css) {
        patterns.css = tech.css.map(s => parsePattern(s).regex);
        hasPatterns = true;
    }
    
    // Convert HTML patterns
    if (tech.html) {
        patterns.html = tech.html.map(s => parsePattern(s).regex);
        hasPatterns = true;
    }
    
    // Convert URL patterns
    if (tech.url) {
        patterns.url = tech.url.map(s => parsePattern(s).regex);
        hasPatterns = true;
    }
    
    // Track skipped features
    if (tech.dns) stats.skippedFeatures.dns++;
    if (tech.robots) stats.skippedFeatures.robots++;
    if (tech.probe) stats.skippedFeatures.probe++;
    if (tech.xhr) stats.skippedFeatures.xhr++;
    if (tech.certIssuer) stats.skippedFeatures.certIssuer++;
    
    // Skip technologies with no usable detection patterns
    const hasUsablePatterns = 
        (patterns.scripts?.length ?? 0) > 0 ||
        (patterns.globals?.length ?? 0) > 0 ||
        (patterns.meta?.length ?? 0) > 0 ||
        (patterns.headers?.length ?? 0) > 0 ||
        (patterns.dom?.length ?? 0) > 0 ||
        (patterns.cookies?.length ?? 0) > 0 ||
        (patterns.css?.length ?? 0) > 0 ||
        (patterns.html?.length ?? 0) > 0 ||
        (patterns.url?.length ?? 0) > 0;
    
    if (!hasUsablePatterns) {
        return null;
    }
    
    const result: TechPattern = {
        name,
        category,
        url: tech.website || '',
        isSignal,
        patterns,
    };
    
    // Add relationships
    if (tech.implies) {
        result.implies = toArray(tech.implies).map(s => parsePattern(s).regex);
    }
    if (tech.excludes) {
        result.excludes = toArray(tech.excludes);
    }
    if (tech.requires) {
        result.requires = toArray(tech.requires);
    }
    
    return result;
}

async function downloadIcons(technologies: Record<string, WebappanalyzerTech>, destDir: string, stats: ConversionStats): Promise<void> {
    console.log('\nDownloading icons...');
    
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    
    const icons = new Set<string>();
    for (const tech of Object.values(technologies)) {
        if (tech.icon) {
            icons.add(tech.icon);
        }
    }
    
    console.log(`Found ${icons.size} unique icons`);
    
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    let batchCount = 0;
    
    const iconArray = Array.from(icons);
    
    for (const icon of iconArray) {
        const destPath = path.join(destDir, icon);
        
        // Skip if already exists
        if (fs.existsSync(destPath)) {
            skipped++;
            downloaded++;
            continue;
        }
        
        // URL encode the icon name for spaces and special chars
        const encodedIcon = encodeURIComponent(icon);
        const url = `https://raw.githubusercontent.com/enthec/webappanalyzer/main/src/icons/${encodedIcon}`;
        
        const success = await downloadFile(url, destPath);
        if (success) {
            downloaded++;
            batchCount++;
            
            // Log progress every 100 downloads
            if (batchCount % 100 === 0) {
                console.log(`  Progress: ${downloaded}/${icons.size} icons (${skipped} skipped, ${failed} failed)...`);
            }
            
            // Add small delay every 50 downloads to avoid rate limiting
            if (batchCount % 50 === 0) {
                await delay(100);
            }
        } else {
            failed++;
            stats.iconsFailed.push(icon);
        }
    }
    
    stats.iconsDownloaded = downloaded;
    console.log(`  ✓ Downloaded ${downloaded - skipped} new icons, ${skipped} already existed, ${failed} failed`);
}

function generateTechPatternsFile(patterns: TechPattern[]): string {
    const lines: string[] = [
        `// AUTO-GENERATED by scripts/convert-webappanalyzer.ts`,
        `// Do not edit manually - regenerate with: npx tsx scripts/convert-webappanalyzer.ts`,
        `// Source: https://github.com/enthec/webappanalyzer`,
        `// Generated: ${new Date().toISOString()}`,
        ``,
        `import type { TechCategory } from './types';`,
        ``,
        `export interface TechPattern {`,
        `    name: string;`,
        `    category: TechCategory;`,
        `    url: string;`,
        `    isSignal: boolean;`,
        `    patterns: {`,
        `        scripts?: RegExp[];`,
        `        globals?: string[];`,
        `        meta?: { name: string; content?: RegExp }[];`,
        `        headers?: { name: string; value?: RegExp }[];`,
        `        dom?: string[];`,
        `        cookies?: { name: string | RegExp; value?: RegExp }[];`,
        `        css?: RegExp[];`,
        `        html?: RegExp[];`,
        `        url?: RegExp[];`,
        `    };`,
        `    confidence?: number;`,
        `    versionGlobal?: string;`,
        `    versionDom?: { selector: string; attribute?: string; regex?: RegExp };`,
        `    versionScript?: RegExp;`,
        `    implies?: string[];`,
        `    excludes?: string[];`,
        `    requires?: string[];`,
        `}`,
        ``,
        `export const TECH_PATTERNS: TechPattern[] = [`,
    ];
    
    for (const pattern of patterns) {
        lines.push(`    {`);
        lines.push(`        name: ${JSON.stringify(pattern.name)},`);
        lines.push(`        category: ${JSON.stringify(pattern.category)},`);
        lines.push(`        url: ${JSON.stringify(pattern.url)},`);
        lines.push(`        isSignal: ${pattern.isSignal},`);
        lines.push(`        patterns: {`);
        
        if (pattern.patterns.scripts?.length) {
            const regexes = pattern.patterns.scripts.map(s => regexToLiteral(s, 'i'));
            lines.push(`            scripts: [${regexes.join(', ')}],`);
        }
        if (pattern.patterns.globals?.length) {
            lines.push(`            globals: ${JSON.stringify(pattern.patterns.globals)},`);
        }
        if (pattern.patterns.meta?.length) {
            const metas = pattern.patterns.meta.map(m => {
                if (m.content) {
                    return `{ name: ${JSON.stringify(m.name)}, content: ${regexToLiteral(m.content, 'i')} }`;
                }
                return `{ name: ${JSON.stringify(m.name)} }`;
            });
            lines.push(`            meta: [${metas.join(', ')}],`);
        }
        if (pattern.patterns.headers?.length) {
            const headers = pattern.patterns.headers.map(h => {
                if (h.value) {
                    return `{ name: ${JSON.stringify(h.name)}, value: ${regexToLiteral(h.value, 'i')} }`;
                }
                return `{ name: ${JSON.stringify(h.name)} }`;
            });
            lines.push(`            headers: [${headers.join(', ')}],`);
        }
        if (pattern.patterns.dom?.length) {
            lines.push(`            dom: ${JSON.stringify(pattern.patterns.dom)},`);
        }
        if (pattern.patterns.cookies?.length) {
            const cookies = pattern.patterns.cookies.map(c => {
                // Check if cookie name looks like a regex (starts with ^ or contains special chars)
                const isRegexName = /^[\^]|[\\()\[\]|*+?{}]/.test(c.name);
                const namePart = isRegexName ? regexToLiteral(c.name, 'i') : JSON.stringify(c.name);
                if (c.value) {
                    return `{ name: ${namePart}, value: ${regexToLiteral(c.value, 'i')} }`;
                }
                return `{ name: ${namePart} }`;
            });
            lines.push(`            cookies: [${cookies.join(', ')}],`);
        }
        if (pattern.patterns.css?.length) {
            const regexes = pattern.patterns.css.map(s => regexToLiteral(s, 'i'));
            lines.push(`            css: [${regexes.join(', ')}],`);
        }
        if (pattern.patterns.html?.length) {
            const regexes = pattern.patterns.html.map(s => regexToLiteral(s, 'i'));
            lines.push(`            html: [${regexes.join(', ')}],`);
        }
        if (pattern.patterns.url?.length) {
            const regexes = pattern.patterns.url.map(s => regexToLiteral(s, ''));
            lines.push(`            url: [${regexes.join(', ')}],`);
        }
        
        lines.push(`        },`);
        
        if (pattern.confidence !== undefined) {
            lines.push(`        confidence: ${pattern.confidence},`);
        }
        if (pattern.implies?.length) {
            lines.push(`        implies: ${JSON.stringify(pattern.implies)},`);
        }
        if (pattern.excludes?.length) {
            lines.push(`        excludes: ${JSON.stringify(pattern.excludes)},`);
        }
        if (pattern.requires?.length) {
            lines.push(`        requires: ${JSON.stringify(pattern.requires)},`);
        }
        
        lines.push(`    },`);
    }
    
    lines.push(`];`);
    lines.push(``);
    
    return lines.join('\n');
}

function generateTechIconsFile(technologies: Record<string, WebappanalyzerTech>): string {
    const lines: string[] = [
        `// AUTO-GENERATED by scripts/convert-webappanalyzer.ts`,
        `// Do not edit manually - regenerate with: npx tsx scripts/convert-webappanalyzer.ts`,
        `// Source: https://github.com/enthec/webappanalyzer`,
        `// Generated: ${new Date().toISOString()}`,
        ``,
        `// Map tech names to their icon filenames`,
        `const TECH_ICON_MAP: Record<string, string> = {`,
    ];
    
    const sortedNames = Object.keys(technologies).sort();
    
    for (const name of sortedNames) {
        const tech = technologies[name];
        if (tech.icon) {
            lines.push(`    ${JSON.stringify(name)}: ${JSON.stringify(tech.icon)},`);
        }
    }
    
    lines.push(`};`);
    lines.push(``);
    lines.push(`export function getTechIcon(techName: string): string | undefined {`);
    lines.push(`    const filename = TECH_ICON_MAP[techName];`);
    lines.push(`    if (filename) {`);
    lines.push(`        return new URL(\`../assets/tech-icons/\${filename}\`, import.meta.url).href;`);
    lines.push(`    }`);
    lines.push(`    return undefined;`);
    lines.push(`}`);
    lines.push(``);
    
    return lines.join('\n');
}

// ============================================================================
// PRESERVE EXISTING AI PATTERNS
// ============================================================================

function getExistingAIPatterns(): string[] {
    // These are the AI-generated patterns we want to preserve
    return [
        'v0', 'Vercel v0', 'Lovable', 'Bolt', 'Replit', 'StackBlitz', 'CodeSandbox', 'Glitch',
        'Create React App', 'Vite Starter', 'GitHub Copilot Workspace', 'Cursor', 'Windsurf',
        'Devin', 'Claude Artifacts', 'GPT Engineer', 'Durable', 'Hostinger AI', 'Mixo',
        '10Web AI', 'Relume', 'Teleporthq', 'Builder.io', 'Magic Patterns', 'Base44',
        'Wix ADI', 'Jimdo', 'Hocoos', 'Dora AI', 'Uizard', 'Framer AI', 'Wegic',
        'Canva Websites', 'Tilda', 'Softr', 'Typedream', 'Unicorn Platform', 'Unbounce',
        'Leadpages', 'Instapage', 'Brizy', 'Elementor AI', 'Divi AI', 'Super.so',
        'Potion', 'Notion Sites', 'Pico', 'Makeswift', 'Plasmic', 'Visual Copilot',
        'Locofy', 'Anima', 'TeleportHQ', 'Screenshot to Code', 'Vercel Ship',
        'Tempo Labs', 'Ziply', 'Kombai', 'Webstudio', 'Fable', 'Gamma', 'Tome',
        'Beautiful.ai', 'GitLab Pages', 'Appy Pie', 'Pineapple AI', 'Linkfolio',
        'Replo', 'Shogun', 'PageFly', 'GemPages', 'Landen', 'Sheet2Site',
        'Spreadsheet Web', 'Val Town', 'Hugging Face Spaces', 'Gradio', 'Streamlit',
        'Dash', 'Anvil', 'Retool', 'Appsmith', 'Tooljet', 'n8n', 'Windmill',
    ];
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('='.repeat(60));
    console.log('webappanalyzer -> tracer-v2 Conversion Script');
    console.log('='.repeat(60));
    console.log('');
    
    const stats: ConversionStats = {
        totalTechnologies: 0,
        converted: 0,
        skippedFeatures: {
            dns: 0,
            robots: 0,
            probe: 0,
            xhr: 0,
            certIssuer: 0,
        },
        iconsDownloaded: 0,
        iconsFailed: [],
        existingPreserved: 0,
    };
    
    try {
        // Fetch data
        const technologies = await fetchTechnologies();
        stats.totalTechnologies = Object.keys(technologies).length;
        console.log(`\nTotal technologies: ${stats.totalTechnologies}`);
        
        // Get list of existing AI patterns to preserve
        const preservePatterns = new Set(getExistingAIPatterns());
        
        // Convert technologies
        console.log('\nConverting technologies...');
        const patterns: TechPattern[] = [];
        
        for (const [name, tech] of Object.entries(technologies)) {
            // Skip if it's one of our preserved AI patterns
            if (preservePatterns.has(name)) {
                stats.existingPreserved++;
                continue;
            }
            
            const converted = convertTechnology(name, tech, stats);
            if (converted) {
                patterns.push(converted);
                stats.converted++;
            }
        }
        
        console.log(`  ✓ Converted ${stats.converted} technologies`);
        console.log(`  ✓ Preserved ${stats.existingPreserved} existing AI patterns`);
        
        // Download icons (skip if we have enough already)
        const iconDir = path.resolve(__dirname, '../src/assets/tech-icons');
        const existingIcons = fs.existsSync(iconDir) ? fs.readdirSync(iconDir).length : 0;
        if (existingIcons < 1000) {
            await downloadIcons(technologies, iconDir, stats);
        } else {
            console.log(`\nSkipping icon download (${existingIcons} icons already exist)`);
            stats.iconsDownloaded = existingIcons;
        }
        
        // Generate output files
        console.log('\nGenerating output files...');
        
        const outputDir = path.resolve(__dirname, '../src/shared');
        
        // Generate patterns file
        const patternsContent = generateTechPatternsFile(patterns);
        const patternsPath = path.join(outputDir, 'techPatterns.generated.ts');
        fs.writeFileSync(patternsPath, patternsContent);
        console.log(`  ✓ ${patternsPath}`);
        
        // Generate icons file
        const iconsContent = generateTechIconsFile(technologies);
        const iconsPath = path.join(outputDir, 'techIcons.generated.ts');
        fs.writeFileSync(iconsPath, iconsContent);
        console.log(`  ✓ ${iconsPath}`);
        
        // Generate report
        const report = {
            generatedAt: new Date().toISOString(),
            stats,
            preservedPatterns: Array.from(preservePatterns),
        };
        const reportPath = path.join(outputDir, 'conversion-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`  ✓ ${reportPath}`);
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total technologies from webappanalyzer: ${stats.totalTechnologies}`);
        console.log(`Converted: ${stats.converted}`);
        console.log(`Preserved (existing AI patterns): ${stats.existingPreserved}`);
        console.log(`Icons downloaded: ${stats.iconsDownloaded}`);
        console.log(`Icons failed: ${stats.iconsFailed.length}`);
        console.log(`\nSkipped features (require backend support):`);
        console.log(`  - DNS patterns: ${stats.skippedFeatures.dns}`);
        console.log(`  - Robots.txt: ${stats.skippedFeatures.robots}`);
        console.log(`  - Probe endpoints: ${stats.skippedFeatures.probe}`);
        console.log(`  - XHR patterns: ${stats.skippedFeatures.xhr}`);
        console.log(`  - Cert issuer: ${stats.skippedFeatures.certIssuer}`);
        console.log('\n' + '='.repeat(60));
        console.log('NEXT STEPS');
        console.log('='.repeat(60));
        console.log('1. Review the generated files:');
        console.log('   - src/shared/techPatterns.generated.ts');
        console.log('   - src/shared/techIcons.generated.ts');
        console.log('2. To use the new patterns, update your imports in:');
        console.log('   - src/content/extractors/tech.ts');
        console.log('   - Import from techPatterns.generated.ts instead');
        console.log('3. For the icons, they are already in src/assets/tech-icons/');
        console.log('   - Update techIcons.ts to import from techIcons.generated.ts');
        console.log('');
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();

