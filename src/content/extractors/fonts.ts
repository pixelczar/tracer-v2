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
    isIconFont: boolean;
    iconSamples?: string[];
}

export async function extractFonts(): Promise<FontInfo[]> {
    const fontMap = new Map<string, FontDetails>();

    // 1. Scan computed styles
    scanComputedFonts(fontMap);

    // 2. Check for Google Fonts
    detectGoogleFonts(fontMap);

    // 3. Check for Adobe Fonts
    detectAdobeFonts(fontMap);

    // 4. Detect icon fonts
    detectIconFonts(fontMap);

    // 5. Extract icon samples for icon fonts
    extractIconSamples(fontMap);

    // 6. Generate previews
    const fonts = await Promise.all(
        Array.from(fontMap.values()).map(async (details) => ({
            ...details,
            preview: await generatePreview(details),
            isIconFont: details.isIconFont,
            iconSamples: details.iconSamples,
        }))
    );

    return fonts.filter(f => !isSystemFont(f.family));
}

function scanComputedFonts(fontMap: Map<string, FontDetails>) {
    const elements = document.querySelectorAll('body *');
    const sampled = Array.from(elements).slice(0, 300);

    sampled.forEach(el => {
        // Skip Tracer extension's own elements
        if (isTracerElement(el)) return;

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
            isIconFont: false,
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

function detectIconFonts(fontMap: Map<string, FontDetails>) {
    // Icon font name patterns
    const iconFontNamePatterns = [
        /^Material Icons$/i,
        /^Material Symbols/i,
        /^Font Awesome/i,
        /^FontAwesome/i,
        /^IcoMoon/i,
        /^icomoon/i,
        /^Fontello/i,
        /^fontello/i,
        /^Iconic/i,
        /^iconic/i,
        /^Font Custom/i,
        /^fontcustom/i,
        /^Icon Font/i,
        /^iconfont/i,
        /^Glyphicons/i,
        /^glyphicons/i,
        /^Dashicons/i,
        /^dashicons/i,
        /^Genericons/i,
        /^genericons/i,
        /^Foundation Icons/i,
        /^foundation-icons/i,
        /^Elusive Icons/i,
        /^elusive-icons/i,
        /^Typicons/i,
        /^typicons/i,
        /^Entypo/i,
        /^entypo/i,
        /^Linecons/i,
        /^linecons/i,
        /^Zocial/i,
        /^zocial/i,
    ];

    // Check name patterns
    fontMap.forEach(font => {
        if (iconFontNamePatterns.some(pattern => pattern.test(font.family))) {
            font.isIconFont = true;
        }
    });

    // Check usage patterns - look for elements using icon font classes
    const iconClassPatterns = [
        /^fa$/,           // Font Awesome base
        /^fa[srb]$/,      // Font Awesome solid/regular/brands
        /^fas$/,          // Font Awesome solid
        /^far$/,          // Font Awesome regular
        /^fab$/,          // Font Awesome brands
        /^material-icons$/i,
        /^material-symbols/i,
        /^icon-/i,        // Generic icon- prefix
        /^ico-/i,         // Ico- prefix
        /^glyphicon/i,    // Glyphicons
        /^dashicons/i,    // Dashicons
        /^genericon/i,    // Genericons
    ];

    // Sample elements to check for icon font usage
    const elements = document.querySelectorAll('body *');
    const sampled = Array.from(elements).slice(0, 500);

    sampled.forEach(el => {
        if (isTracerElement(el)) return;

        const className = String(el.className || '');
        const classList = className.split(/\s+/);

        // Check if element has icon-related classes
        const hasIconClass = iconClassPatterns.some(pattern => 
            classList.some(cls => pattern.test(cls))
        );

        // Check for icon-related attributes (more specific)
        const hasIconAttr = el.hasAttribute('data-icon') || 
                           (el.getAttribute('aria-label')?.toLowerCase().includes('icon'));

        // Only mark as icon font if element has icon classes AND the font is actually being used
        // Don't mark based on just <i> tags or generic spans - they might use regular fonts
        if (hasIconClass || hasIconAttr) {
            const computed = getComputedStyle(el);
            const rawFamily = computed.fontFamily;
            const family = rawFamily.split(',')[0].replace(/["']/g, '').trim();
            
            // Only mark if the font matches known icon font patterns OR
            // if the element has strong icon indicators (icon classes + icon attributes)
            if (family) {
                const font = fontMap.get(family);
                if (font) {
                    // Check if font name matches icon patterns OR element has strong icon signals
                    const matchesIconPattern = iconFontNamePatterns.some(pattern => pattern.test(family));
                    const hasStrongIconSignal = hasIconClass && (hasIconAttr || el.hasAttribute('data-icon'));
                    
                    if (matchesIconPattern || hasStrongIconSignal) {
                        font.isIconFont = true;
                    }
                }
            }
        }
    });
}

function extractIconSamples(fontMap: Map<string, FontDetails>) {
    // Only process icon fonts
    const iconFonts = Array.from(fontMap.values()).filter(f => f.isIconFont);
    if (iconFonts.length === 0) return;

    const iconClassPatterns = [
        /^fa$/, /^fa[srb]$/, /^fas$/, /^far$/, /^fab$/, /^fa-/,
        /^material-icons$/i, /^material-symbols/i, /^material-symbol/i,
        /^icon-/i, /^ico-/i, /^glyphicon/i, /^dashicons/i, /^genericon/i,
    ];

    // Helper to extract Unicode character from CSS content
    const extractUnicodeChar = (content: string): string | null => {
        // Handle formats like "\f015", "\\f015", "\uf015"
        const unicodeMatch = content.match(/\\[0-9a-fA-F]{1,6}/i);
        if (unicodeMatch) {
            const codePoint = parseInt(unicodeMatch[0].slice(1), 16);
            if (codePoint >= 0xE000 && codePoint <= 0xF8FF) { // Private Use Area
                return String.fromCharCode(codePoint);
            }
        }
        // Handle quoted strings
        const quotedMatch = content.match(/^["'](.{1,2})["']$/);
        if (quotedMatch) {
            return quotedMatch[1];
        }
        // Direct single/double character
        const cleaned = content.replace(/^["']|["']$/g, '');
        if (cleaned.length <= 2) {
            return cleaned;
        }
        return null;
    };

    // Extract samples for each icon font
    iconFonts.forEach(font => {
        const samples: string[] = [];
        const elements = document.querySelectorAll('body *');
        const sampled = Array.from(elements).slice(0, 2000);

        for (const el of sampled) {
            if (samples.length >= 16) break; // Limit to 16 samples
            if (isTracerElement(el)) continue;

            const className = String(el.className || '');
            const classList = className.split(/\s+/);
            const hasIconClass = iconClassPatterns.some(pattern => 
                classList.some(cls => pattern.test(cls))
            );

            if (hasIconClass || el.hasAttribute('data-icon')) {
                const computed = getComputedStyle(el);
                const rawFamily = computed.fontFamily;
                const family = rawFamily.split(',')[0].replace(/["']/g, '').trim();

                if (family === font.family) {
                    let iconChar = '';
                    
                    // Try ::before pseudo-element first
                    try {
                        const beforeContent = window.getComputedStyle(el, '::before').content;
                        if (beforeContent && beforeContent !== 'none' && beforeContent !== '""' && beforeContent !== "''") {
                            const extracted = extractUnicodeChar(beforeContent);
                            if (extracted) iconChar = extracted;
                        }
                    } catch (e) {
                        // Some browsers don't support pseudo-element in getComputedStyle
                    }

                    // Fallback: Check text content
                    if (!iconChar) {
                        const text = el.textContent?.trim();
                        if (text && text.length === 1 && !className.includes('material')) {
                            iconChar = text;
                        }
                    }

                    // Try ::after as fallback
                    if (!iconChar) {
                        try {
                            const afterContent = window.getComputedStyle(el, '::after').content;
                            if (afterContent && afterContent !== 'none' && afterContent !== '""' && afterContent !== "''") {
                                const extracted = extractUnicodeChar(afterContent);
                                if (extracted) iconChar = extracted;
                            }
                        } catch (e) {
                            // Ignore
                        }
                    }

                    if (iconChar && !samples.includes(iconChar)) {
                        samples.push(iconChar);
                    }
                }
            }
        }

        // If we didn't find enough samples, try scanning all elements using the font
        if (samples.length < 8) {
            for (const el of Array.from(document.querySelectorAll('body *')).slice(0, 1000)) {
                if (samples.length >= 16) break;
                if (isTracerElement(el)) continue;
                
                const computed = getComputedStyle(el);
                const rawFamily = computed.fontFamily;
                const family = rawFamily.split(',')[0].replace(/["']/g, '').trim();
                
                if (family === font.family) {
                    const text = el.textContent?.trim();
                    if (text && text.length === 1 && !samples.includes(text)) {
                        const code = text.charCodeAt(0);
                        // Private Use Area or high Unicode ranges often contain icons
                        if ((code >= 0xE000 && code <= 0xF8FF) || code > 0x1F000) {
                            samples.push(text);
                        }
                    }
                }
            }
        }

        if (samples.length > 0) {
            font.iconSamples = samples;
        }
    });
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
    const weightPreviews: Record<string, string[]> = {};
    for (const weight of font.weights) {
        weightPreviews[weight] = await Promise.all(
            PANGRAMS.map(p => renderFontToCanvas(font.family, p, font.isMono, weight))
        );
    }

    return {
        method: 'canvas',
        data: weightPreviews[font.weights[0]]?.[0] || '',
        previews: weightPreviews[font.weights[0]] || [],
        weightPreviews,
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

async function renderFontToCanvas(family: string, text: string, isMono: boolean, weight: string = '400'): Promise<string> {
    // Attempt to ensure font is loaded
    try {
        await document.fonts.load(`${weight} 16px "${family}"`);
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
    const fontString = `${weight} ${size}px ${familyQuery}, ${fallback}`;

    ctx.font = fontString;

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];
    const maxLines = 2;

    for (let i = 1; i < words.length; i++) {
        if (lines.length >= maxLines - 1) {
            // We're on the last line, check if we need to truncate
            const testLine = currentLine + " " + words[i];
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth >= maxWidth) {
                // Truncate with ellipsis
                let truncated = currentLine;
                while (ctx.measureText(truncated + "...").width >= maxWidth && truncated.length > 0) {
                    truncated = truncated.slice(0, -1);
                }
                lines.push(truncated + "...");
                break;
            } else {
                currentLine = testLine;
            }
        } else {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
    }
    
    // Add the last line if we haven't reached max lines
    if (lines.length < maxLines) {
        lines.push(currentLine);
    }

    canvas.width = maxWidth;
    canvas.height = Math.min(lines.length, maxLines) * size * 1.2 + 20;

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

function isTracerElement(el: Element): boolean {
    // Check if element is part of Tracer extension UI
    const id = el.id || '';
    // className can be a string or DOMTokenList, so convert to string safely
    const className = String(el.className || '');
    
    // Check for tracer- prefix in ID or class
    if (id.startsWith('tracer-') || className.includes('tracer-')) {
        return true;
    }
    
    // Check if element is inside a tracer container
    let parent = el.parentElement;
    while (parent) {
        const parentId = parent.id || '';
        const parentClassName = String(parent.className || '');
        if (parentId.startsWith('tracer-') || parentClassName.includes('tracer-')) {
            return true;
        }
        parent = parent.parentElement;
    }
    
    return false;
}
