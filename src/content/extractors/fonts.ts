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
    isMono: boolean;
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
        const rawFamily = computed.fontFamily;
        const family = rawFamily.split(',')[0].replace(/["']/g, '').trim();

        if (!family) return;

        const existing = fontMap.get(family) || {
            family,
            weights: [],
            styles: [],
            letterSpacing: [],
            lineHeight: [],
            sizes: [],
            source: 'custom' as const,
            isMono: rawFamily.toLowerCase().includes('monospace'),
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

const PANGRAMS = [
    "Sphinx of black quartz, judge my vow",
    "How quickly daft jumping zebras vex",
    "The five boxing wizards jump quickly",
    "Pack my box with five dozen liquor jugs",
    "Quick wafting zephyrs vex bold Jim"
];

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
    const previews = await Promise.all(PANGRAMS.map(p => renderFontToCanvas(font.family, p, font.isMono)));
    return {
        method: 'canvas',
        data: previews[0],
        previews,
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

async function renderFontToCanvas(family: string, text: string, isMono: boolean): Promise<string> {
    // Attempt to ensure font is loaded
    try {
        await document.fonts.load(`16px "${family}"`);
    } catch (e) { }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const size = 64;
    const maxWidth = 800;

    // Build robust font string
    const systemKeywords = ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];
    const isSystemKey = systemKeywords.includes(family);

    // Non-system keywords must be quoted
    const familyQuery = isSystemKey ? family : `"${family}"`;
    const fallback = isMono ? 'monospace' : 'sans-serif';
    const fontString = `${size}px ${familyQuery}, ${fallback}`;

    ctx.font = fontString;

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    canvas.width = maxWidth;
    canvas.height = lines.length * size * 1.2 + 20;

    // Reset context properties after resize
    ctx.font = fontString;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
        ctx.fillText(line, 0, i * size * 1.2 + 10);
    });

    return canvas.toDataURL();
}

const SYSTEM_FONTS = [
    'sans-serif', 'serif', 'monospace',
];

function isSystemFont(family: string): boolean {
    return SYSTEM_FONTS.includes(family.toLowerCase());
}
