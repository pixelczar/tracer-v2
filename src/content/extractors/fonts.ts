import type { FontInfo, FontPreview } from '../../shared/types';

interface FontDetails {
    family: string;
    weights: string[];
    styles: ('normal' | 'italic')[];
    letterSpacing: string[];
    lineHeight: string[];
    sizes: string[];
    source: 'google' | 'adobe' | 'custom' | 'system';
    url?: string;
}

export async function extractFonts(): Promise<FontInfo[]> {
    const fontMap = new Map<string, FontDetails>();

    // 1. Scan computed styles
    scanComputedFonts(fontMap);

    // 2. Check for Google Fonts
    detectGoogleFonts(fontMap);

    // 3. Check for Adobe Fonts
    detectAdobeFonts(fontMap);

    // 4. Generate previews
    const fonts = await Promise.all(
        Array.from(fontMap.values()).map(async (details) => ({
            ...details,
            preview: await generatePreview(details),
        }))
    );

    return fonts.filter(f => !isSystemFont(f.family));
}

function scanComputedFonts(fontMap: Map<string, FontDetails>) {
    const elements = document.querySelectorAll('body *');
    const sampled = Array.from(elements).slice(0, 300);

    sampled.forEach(el => {
        const computed = getComputedStyle(el);
        const family = computed.fontFamily.split(',')[0].replace(/["']/g, '').trim();

        if (!family) return;

        const existing = fontMap.get(family) || {
            family,
            weights: [],
            styles: [],
            letterSpacing: [],
            lineHeight: [],
            sizes: [],
            source: 'custom' as const,
        };

        const weight = computed.fontWeight;
        const style = computed.fontStyle as 'normal' | 'italic';
        const letterSpacing = computed.letterSpacing;
        const lineHeight = computed.lineHeight;
        const size = computed.fontSize;

        if (!existing.weights.includes(weight)) existing.weights.push(weight);
        if (!existing.styles.includes(style)) existing.styles.push(style);
        if (letterSpacing !== 'normal' && !existing.letterSpacing.includes(letterSpacing)) {
            existing.letterSpacing.push(letterSpacing);
        }
        if (!existing.lineHeight.includes(lineHeight)) existing.lineHeight.push(lineHeight);
        if (!existing.sizes.includes(size)) existing.sizes.push(size);

        fontMap.set(family, existing);
    });
}

function detectGoogleFonts(fontMap: Map<string, FontDetails>) {
    const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    links.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        const familyMatch = href.match(/family=([^&:]+)/);
        if (familyMatch) {
            const family = decodeURIComponent(familyMatch[1]).replace(/\+/g, ' ');
            const existing = fontMap.get(family);
            if (existing) {
                existing.source = 'google';
                existing.url = `https://fonts.google.com/specimen/${family.replace(/ /g, '+')}`;
            }
        }
    });
}

function detectAdobeFonts(fontMap: Map<string, FontDetails>) {
    const links = document.querySelectorAll('link[href*="use.typekit.net"]');
    if (links.length > 0) {
        fontMap.forEach(font => {
            if (font.source === 'custom') {
                font.source = 'adobe';
                font.url = 'https://fonts.adobe.com';
            }
        });
    }
}

async function generatePreview(font: FontDetails): Promise<FontPreview> {
    // Google Fonts — use import URL
    if (font.source === 'google') {
        return {
            method: 'google',
            data: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:wght@${font.weights.join(';')}`,
        };
    }

    // Try to extract font as data URI
    const fontUrl = findFontUrl(font.family);
    if (fontUrl) {
        try {
            const response = await fetch(fontUrl);
            const buffer = await response.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            return {
                method: 'datauri',
                data: `data:font/woff2;base64,${base64}`,
            };
        } catch {
            // CORS blocked
        }
    }

    // Fallback: render via canvas
    return {
        method: 'canvas',
        data: renderFontToCanvas(font.family),
    };
}

function findFontUrl(family: string): string | null {
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule instanceof CSSFontFaceRule) {
                    if (rule.style.fontFamily.includes(family)) {
                        const src = rule.style.getPropertyValue('src');
                        const urlMatch = src.match(/url\(["']?([^"')]+)["']?\)/);
                        if (urlMatch) return urlMatch[1];
                    }
                }
            }
        } catch {
            // CORS blocked
        }
    }
    return null;
}

function renderFontToCanvas(family: string): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const text = 'Sphinx of black quartz, judge my vow';
    const size = 32;

    ctx.font = `${size}px "${family}"`;
    const metrics = ctx.measureText(text);

    canvas.width = metrics.width + 20;
    canvas.height = size * 1.5;

    ctx.font = `${size}px "${family}"`;
    ctx.fillStyle = getComputedStyle(document.body).color || '#000';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 10, canvas.height / 2);

    return canvas.toDataURL();
}

const SYSTEM_FONTS = [
    'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
    'Roboto', 'Helvetica', 'Arial', 'sans-serif', 'serif', 'monospace',
];

function isSystemFont(family: string): boolean {
    return SYSTEM_FONTS.some(f => family.toLowerCase().includes(f.toLowerCase()));
}
