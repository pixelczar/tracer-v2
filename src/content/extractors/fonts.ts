import type { FontInfo, FontPreview } from '../../shared/types';
import { getSettingsAsync } from '../../shared/settings';

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
    isSerif: boolean;
    isIconFont: boolean;
    iconSamples?: string[];
}

export async function extractFonts(): Promise<FontInfo[]> {
    const fontMap = new Map<string, FontDetails>();
    const fontNameMap = new Map<string, string>(); // Maps CSS names to actual font names

    // 1. Scan computed styles (collect CSS names first)
    scanComputedFonts(fontMap, fontNameMap);

    // 2. Check document.fonts API for all loaded fonts (catches fonts not in first 300 elements)
    detectLoadedFonts(fontMap, fontNameMap);
    
    // 3. Build a map of CSS font names to actual font names from document.fonts and @font-face
    // Do this after collecting all CSS names
    await buildFontNameMap(fontNameMap);

    // 3. Check for Google Fonts
    detectGoogleFonts(fontMap);

    // 4. Check for Adobe Fonts
    detectAdobeFonts(fontMap);

    // 5. Detect icon fonts
    detectIconFonts(fontMap);

    // 6. Extract icon samples for icon fonts
    extractIconSamples(fontMap);

    // 7. Normalize weights for variable fonts
    normalizeVariableFontWeights(fontMap);

    // 8. Generate previews
    const settings = await getSettingsAsync();
    const previewText = getFontPreviewText(settings.fontPreviewSource);
    const fonts = await Promise.all(
        Array.from(fontMap.values()).map(async (details) => {
            // Use actual font name if available, otherwise use the CSS name
            const actualName = fontNameMap.get(details.family) || details.family;
            return {
                ...details,
                family: actualName,
                preview: await generatePreview(details, previewText),
                isMono: details.isMono,
                isSerif: details.isSerif,
                isIconFont: details.isIconFont,
                iconSamples: details.iconSamples,
            };
        })
    );

    return fonts.filter(f => !isSystemFont(f.family));
}

async function buildFontNameMap(fontNameMap: Map<string, string>) {
    // Collect all CSS names that need mapping (from fontNameMap keys)
    const cssNames = Array.from(fontNameMap.keys());
    if (cssNames.length === 0) return;
    
    // Map CSS names to actual font names by parsing @font-face rules
    // Look for local() fallbacks and font file URLs that might contain the actual font name
    const cssToActualName = new Map<string, string>();
    
    try {
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule instanceof CSSFontFaceRule) {
                        const cssFontFamily = rule.style.fontFamily.split(',')[0].replace(/["']/g, '').trim();
                        if (!cssFontFamily || cssNames.indexOf(cssFontFamily) === -1) continue;
                        
                        // Check for local() fallbacks in src - these often contain the actual font name
                        const src = rule.style.getPropertyValue('src');
                        if (src) {
                            // Look for local("Font Name") patterns
                            const localMatches = src.match(/local\(["']([^"']+)["']\)/gi);
                            if (localMatches && localMatches.length > 0) {
                                // Use the first local() name that looks like a real font name
                                for (const localMatch of localMatches) {
                                    const fontName = localMatch.replace(/local\(["']|["']\)/gi, '').trim();
                                    // Prefer names that don't look like CSS variables
                                    if (fontName && !fontName.startsWith('__') && !/_[a-f0-9]{6,}$/i.test(fontName)) {
                                        cssToActualName.set(cssFontFamily, fontName);
                                        break;
                                    }
                                }
                            }
                            
                            // Also try to extract font name from font file URLs
                            // Many fonts have the actual name in the filename
                            // But be very strict - only use if it looks like a real font name
                            if (!cssToActualName.has(cssFontFamily)) {
                                const urlMatches = src.match(/url\(["']?([^"')]+)["']?\)/gi);
                                if (urlMatches) {
                                    for (const urlMatch of urlMatches) {
                                        const url = urlMatch.replace(/url\(["']?|["']?\)/gi, '').trim();
                                        // Extract filename and try to get font name from it
                                        const filename = url.split('/').pop() || '';
                                        // Remove common extensions and hash suffixes
                                        let nameFromUrl = filename
                                            .replace(/\.(woff2?|ttf|otf|eot)$/i, '')
                                            .replace(/[-_][a-f0-9]{6,}$/i, '')
                                            .replace(/[-_]Regular$|[-_]Bold$|[-_]Italic$/i, '');
                                        
                                        // Be very strict about what we accept
                                        // Reject if:
                                        // - Entirely hex/hash-like
                                        // - Mostly hex characters (>70%)
                                        // - Contains suspicious patterns like "S.p", ".p", etc.
                                        // - Too short or too long
                                        // - Doesn't contain at least one letter
                                        const hexChars = (nameFromUrl.match(/[a-f0-9]/gi) || []).length;
                                        const totalChars = nameFromUrl.length;
                                        const hexRatio = totalChars > 0 ? hexChars / totalChars : 0;
                                        
                                        const hasLetters = /[a-z]/i.test(nameFromUrl);
                                        const hasSuspiciousPattern = /\.(p|s|js|css)$/i.test(nameFromUrl) || 
                                                                    /\sS\.p$/i.test(nameFromUrl) ||
                                                                    /^[a-f0-9]{8,}/i.test(nameFromUrl);
                                        
                                        if (nameFromUrl && 
                                            nameFromUrl.length >= 3 && 
                                            nameFromUrl.length <= 50 &&
                                            !nameFromUrl.startsWith('__') && 
                                            !/^[a-f0-9]{6,}$/i.test(nameFromUrl) &&
                                            hexRatio < 0.7 &&
                                            hasLetters &&
                                            !hasSuspiciousPattern) {
                                            // Clean up the name
                                            const cleaned = nameFromUrl
                                                .replace(/[-_]/g, ' ')
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                .join(' ');
                                            cssToActualName.set(cssFontFamily, cleaned);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                // CORS blocked - skip this stylesheet
                continue;
            }
        }
    } catch (e) {
        // Error accessing stylesheets
    }
    
    // Try to get actual font names by checking what fonts are actually rendered
    // Create test elements and check what font the browser reports
    if (document.fonts && document.fonts.size > 0) {
        for (const cssName of cssNames) {
            if (cssToActualName.has(cssName)) continue; // Already mapped
            
            // Create a test element to see what font is actually rendered
            const testEl = document.createElement('span');
            testEl.style.fontFamily = `"${cssName}"`;
            testEl.style.position = 'absolute';
            testEl.style.visibility = 'hidden';
            testEl.style.fontSize = '16px';
            testEl.textContent = 'A';
            document.body.appendChild(testEl);
            
            // Wait a bit for font to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check document.fonts to see which font face is actually being used
            // Note: fontFace.family usually just returns the CSS name, not the actual font name
            // So we'll only use it if it's clearly a clean, real font name
            for (const fontFace of document.fonts) {
                const fontSpec = `400 normal 16px "${cssName}"`;
                if (document.fonts.check(fontSpec)) {
                    const fontFaceFamily = fontFace.family;
                    // Only use if it's clearly different and looks like a real font name
                    if (fontFaceFamily !== cssName && 
                        fontFaceFamily.length >= 2 &&
                        fontFaceFamily.length <= 50 &&
                        !fontFaceFamily.startsWith('__') && 
                        !/_[a-f0-9]{6,}$/i.test(fontFaceFamily) &&
                        !/^[a-f0-9]{8,}/i.test(fontFaceFamily) &&
                        /[a-z]/i.test(fontFaceFamily) &&
                        !/\.(p|s|js|css)$/i.test(fontFaceFamily)) {
                        // Only use if we don't already have a better mapping
                        if (!cssToActualName.has(cssName)) {
                            cssToActualName.set(cssName, fontFaceFamily);
                        }
                        break;
                    }
                }
            }
            
            document.body.removeChild(testEl);
        }
    }
    
    // Apply mappings
    for (const cssName of cssNames) {
        // Skip if already mapped to a different name
        const currentMapping = fontNameMap.get(cssName);
        if (currentMapping && currentMapping !== cssName) {
            continue; // Already mapped to a different name
        }
        
        // Check if this looks like a CSS variable name that needs cleaning
        const needsCleaning = cssName.startsWith('__') || /_[a-f0-9]{6,}$/i.test(cssName);
        
        if (!needsCleaning) {
            continue; // Already a clean name
        }
        
        // Priority 1: Use mapped actual name from local() or clean document.fonts match
        if (cssToActualName.has(cssName)) {
            const mappedName = cssToActualName.get(cssName)!;
            // Validate the mapped name is reasonable
            if (mappedName.length >= 2 && 
                mappedName.length <= 50 &&
                !/^[a-f0-9]{6,}$/i.test(mappedName) &&
                /[a-z]/i.test(mappedName)) {
                fontNameMap.set(cssName, mappedName);
                continue;
            }
        }
        
        // Priority 2: Use cleaned version of CSS name (most reliable fallback)
        const cleaned = cleanFontName(cssName);
        if (cleaned !== cssName && cleaned.length > 0 && cleaned.length <= 50) {
            fontNameMap.set(cssName, cleaned);
        }
    }
}

function cleanFontName(name: string): string {
    // Remove leading underscores and hash suffixes like "_b7b820"
    let cleaned = name.replace(/^_+/, ''); // Remove leading underscores
    cleaned = cleaned.replace(/_[a-f0-9]{6,}$/i, ''); // Remove hash suffix like "_b7b820"
    
    // Convert camelCase to Title Case
    // "foundersGrotesk" -> "Founders Grotesk"
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Capitalize first letter of each word
    cleaned = cleaned.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    return cleaned;
}

function scanComputedFonts(fontMap: Map<string, FontDetails>, fontNameMap: Map<string, string>) {
    const elements = document.querySelectorAll('body *');
    const sampled = Array.from(elements).slice(0, 300);

    sampled.forEach(el => {
        // Skip Tracer extension's own elements
        if (isTracerElement(el)) return;

        const computed = getComputedStyle(el);
        const rawFamily = computed.fontFamily;
        const family = rawFamily.split(',')[0].replace(/["']/g, '').trim();

        if (!family) return;

        // Add CSS name to fontNameMap for later mapping
        if (!fontNameMap.has(family)) {
            fontNameMap.set(family, family); // Initialize with same name, will be updated later
        }

        // Detect monospace fonts: check for "monospace" in font-family stack or "mono" in font name
        const isMono = rawFamily.toLowerCase().includes('monospace') || 
                      family.toLowerCase().includes('mono');
        
        // Detect serif fonts: ONLY check the actual font name (not fallbacks in the stack)
        // Also check for common serif font name patterns
        const lowerFamily = family.toLowerCase();
        // Only check the primary font name, not the fallback stack (which often contains "serif" or "sans-serif")
        const isSerif = lowerFamily.includes('serif') ||
                       // Check for common serif font name patterns (but exclude "sans" which indicates sans-serif)
                       (!lowerFamily.includes('sans') && (
                           lowerFamily.includes('times') ||
                           lowerFamily.includes('georgia') ||
                           lowerFamily.includes('garamond') ||
                           lowerFamily.includes('baskerville') ||
                           lowerFamily.includes('caslon') ||
                           lowerFamily.includes('minion') ||
                           lowerFamily.includes('palatino') ||
                           lowerFamily.includes('bookman') ||
                           lowerFamily.includes('kalice') || // Known serif font
                           lowerFamily.includes('merriweather') ||
                           lowerFamily.includes('lora') ||
                           lowerFamily.includes('crimson') ||
                           lowerFamily.includes('libre baskerville')
                       ));
        
        const existing = fontMap.get(family) || {
            family,
            weights: [],
            styles: [],
            letterSpacing: [],
            lineHeight: [],
            sizes: [],
            source: 'custom' as const,
            isMono,
            isSerif,
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

function detectLoadedFonts(fontMap: Map<string, FontDetails>, fontNameMap: Map<string, string>) {
    // Use a broader sample to catch fonts that might not be in the first 300 elements
    // Only add fonts that are actually being used (in computed styles), not just defined
    
    try {
        // Check computed styles from a broader sample to catch fonts in use
        const elements = document.querySelectorAll('body *');
        const broaderSample = Array.from(elements).slice(300, 800); // Sample elements 300-800 (500 more elements)

        broaderSample.forEach(el => {
            if (isTracerElement(el)) return;

            const computed = getComputedStyle(el);
            const rawFamily = computed.fontFamily;
            if (!rawFamily) return;

            // Extract the primary font family (first in stack)
            const primaryFamily = rawFamily.split(',')[0].replace(/["']/g, '').trim();
            if (!primaryFamily || isSystemFont(primaryFamily)) return;
            
            // Collect CSS name for later mapping
            if (!fontNameMap.has(primaryFamily)) {
                fontNameMap.set(primaryFamily, primaryFamily); // Initialize with same name, will be updated later
            }

            // Only add if not already in map (to catch fonts missed in first 300)
            if (!fontMap.has(primaryFamily)) {
                const weight = computed.fontWeight;
                const style = computed.fontStyle as 'normal' | 'italic';
                const letterSpacing = computed.letterSpacing;
                const lineHeight = computed.lineHeight;
                const size = computed.fontSize;

                // Detect monospace fonts: check for "monospace" in font-family stack or "mono" in font name
                const isMono = rawFamily.toLowerCase().includes('monospace') || 
                              primaryFamily.toLowerCase().includes('mono');
                
                // Detect serif fonts: ONLY check the actual font name (not fallbacks in the stack)
                // Also check for common serif font name patterns
                const lowerFamily = primaryFamily.toLowerCase();
                // Only check the primary font name, not the fallback stack (which often contains "serif" or "sans-serif")
                const isSerif = lowerFamily.includes('serif') ||
                               // Check for common serif font name patterns (but exclude "sans" which indicates sans-serif)
                               (!lowerFamily.includes('sans') && (
                                   lowerFamily.includes('times') ||
                                   lowerFamily.includes('georgia') ||
                                   lowerFamily.includes('garamond') ||
                                   lowerFamily.includes('baskerville') ||
                                   lowerFamily.includes('caslon') ||
                                   lowerFamily.includes('minion') ||
                                   lowerFamily.includes('palatino') ||
                                   lowerFamily.includes('bookman') ||
                                   lowerFamily.includes('kalice') || // Known serif font
                                   lowerFamily.includes('merriweather') ||
                                   lowerFamily.includes('lora') ||
                                   lowerFamily.includes('crimson') ||
                                   lowerFamily.includes('libre baskerville')
                               ));
                
                fontMap.set(primaryFamily, {
                    family: primaryFamily,
                    weights: [weight],
                    styles: [style],
                    letterSpacing: letterSpacing !== 'normal' ? [letterSpacing] : [],
                    lineHeight: [lineHeight],
                    sizes: [size],
                    source: 'custom' as const,
                    isMono,
                    isSerif,
                    isIconFont: false,
                });
            } else {
                // Update existing font with properties from this element
                const existing = fontMap.get(primaryFamily)!;
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
            }
        });
    } catch (e) {
        // Fallback if there's an error
        console.warn('[Tracer] Error detecting loaded fonts:', e);
    }
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

function getFontPreviewText(source: 'pangram' | 'og-description' | 'page-content'): string {
    if (source === 'pangram') {
        return PANGRAMS[Math.floor(Math.random() * PANGRAMS.length)];
    }

    if (source === 'og-description') {
        const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ||
            document.querySelector<HTMLMetaElement>('meta[name="og:description"]')?.content;
        if (ogDesc && ogDesc.length > 20) {
            return ogDesc.slice(0, 200); // Limit length
        }
    }

    if (source === 'page-content') {
        // Try page title first
        const title = document.title;
        if (title && title.length > 20) {
            return title;
        }

        // Try first paragraph
        const firstP = document.querySelector('p');
        if (firstP?.textContent && firstP.textContent.length > 20) {
            return firstP.textContent.slice(0, 200);
        }

        // Try meta description
        const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content;
        if (metaDesc && metaDesc.length > 20) {
            return metaDesc.slice(0, 200);
        }
    }

    // Fallback to pangram
    return PANGRAMS[Math.floor(Math.random() * PANGRAMS.length)];
}

async function generatePreview(font: FontDetails, previewText?: string): Promise<FontPreview> {
    const textToUse = previewText || PANGRAMS[0];
    
    // Google Fonts — use import URL
    if (font.source === 'google') {
        return {
            method: 'google',
            data: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:wght@${font.weights.join(';')}`,
            previewText: textToUse,
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
                previewText: textToUse,
            };
        } catch {
            // CORS blocked - font file exists but can't be fetched
            // Check if font is already loaded on the page - if so, use CSS method
            if (document.fonts && document.fonts.check) {
                const fontSpec = `${font.weights[0] || '400'} 16px "${font.family}"`;
                if (document.fonts.check(fontSpec)) {
                    // Font is loaded on the page - use CSS method so browser can render it
                    return {
                        method: 'css',
                        data: font.family,
                        previewText: textToUse,
                    };
                }
            }
        }
    } else {
        // No font URL found, but check if font is loaded on the page
        if (document.fonts && document.fonts.check) {
            const fontSpec = `${font.weights[0] || '400'} 16px "${font.family}"`;
            if (document.fonts.check(fontSpec)) {
                // Font is loaded on the page - use CSS method so browser can render it
                return {
                    method: 'css',
                    data: font.family,
                    previewText: textToUse,
                };
            }
        }
    }

    // Fallback: render via canvas (only if font can't be accessed via CSS)
    const weightPreviews: Record<string, string[]> = {};
    for (const weight of font.weights) {
        weightPreviews[weight] = await Promise.all(
            [textToUse].map(p => renderFontToCanvas(font.family, p, font.isMono, font.isSerif, weight))
        );
    }

    return {
        method: 'canvas',
        data: weightPreviews[font.weights[0]]?.[0] || '',
        previews: weightPreviews[font.weights[0]] || [],
        weightPreviews,
        previewText: textToUse,
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

async function renderFontToCanvas(family: string, text: string, isMono: boolean, isSerif: boolean, weight: string = '400'): Promise<string> {
    // Attempt to ensure font is loaded - try multiple approaches
    try {
        // Try loading with the exact font family name (quoted)
        const fontSpecQuoted = `${weight} 16px "${family}"`;
        await document.fonts.load(fontSpecQuoted);
        
        // Also try without quotes (some fonts need this)
        const fontSpecUnquoted = `${weight} 16px ${family}`;
        await document.fonts.load(fontSpecUnquoted);
        
        // Wait for font to be ready - check multiple times
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            if (document.fonts.check(fontSpecQuoted) || document.fonts.check(fontSpecUnquoted)) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
        }
    } catch (e) {
        // Font loading failed, continue anyway
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const size = 64;
    const maxWidth = 800;

    // Build robust font string
    const systemKeywords = ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];
    const isSystemKey = systemKeywords.includes(family);

    // Non-system keywords must be quoted
    const familyQuery = isSystemKey ? family : `"${family}"`;
    // Use appropriate fallback - but the actual font should load, not the fallback
    let fallback: string;
    if (isMono) {
        fallback = 'monospace';
    } else if (isSerif) {
        fallback = 'serif';
    } else {
        fallback = 'sans-serif';
    }
    const fontString = `${weight} ${size}px ${familyQuery}, ${fallback}`;

    ctx.font = fontString;
    
    // Verify the actual font is being used, not just the fallback
    // Check if the font is actually loaded by testing character rendering
    if (!isSystemKey && document.fonts && document.fonts.check) {
        const fontSpec = `${weight} ${size}px "${family}"`;
        const isFontLoaded = document.fonts.check(fontSpec);
        
        if (!isFontLoaded) {
            // Font isn't loaded - this means we'll be using the fallback
            // For monospace fonts, we want to ensure we're using the actual font
            // Try one more time to load it
            try {
                await document.fonts.load(fontSpec);
                // Re-check after loading
                if (document.fonts.check(fontSpec)) {
                    ctx.font = fontString; // Re-apply font after loading
                }
            } catch (e) {
                // Font loading failed - will use fallback
            }
        }
    }

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

function normalizeVariableFontWeights(fontMap: Map<string, FontDetails>) {
    // Standard font weights: 100, 200, 300, 400, 500, 600, 700, 800, 900
    const STANDARD_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    
    fontMap.forEach((font, family) => {
        if (font.weights.length === 0) return;
        
        // Convert all weights to numbers
        const numericWeights = font.weights
            .map(w => {
                const num = typeof w === 'string' ? parseFloat(w) : w;
                return isNaN(num) ? null : num;
            })
            .filter((w): w is number => w !== null);
        
        if (numericWeights.length === 0) return;
        
        // Check if this is likely a variable font
        // Variable fonts have many non-standard weights (not multiples of 100)
        const hasNonStandardWeights = numericWeights.some(w => {
            const rounded = Math.round(w);
            return rounded < 100 || rounded > 900 || !STANDARD_WEIGHTS.includes(rounded);
        });
        
        // If we have many weights (>6) with non-standard values, it's likely a variable font
        const isLikelyVariable = hasNonStandardWeights && font.weights.length > 6;
        
        if (isLikelyVariable) {
            // Group similar weights together (within 25 units)
            const normalizedWeights = new Set<number>();
            
            numericWeights.forEach(weight => {
                // Find if there's a similar weight already (within 25)
                let foundSimilar = false;
                for (const existing of normalizedWeights) {
                    if (Math.abs(weight - existing) < 25) {
                        foundSimilar = true;
                        // Use the weight closer to a standard weight
                        const existingDist = Math.min(...STANDARD_WEIGHTS.map(sw => Math.abs(existing - sw)));
                        const weightDist = Math.min(...STANDARD_WEIGHTS.map(sw => Math.abs(weight - sw)));
                        if (weightDist < existingDist) {
                            normalizedWeights.delete(existing);
                            normalizedWeights.add(weight);
                        }
                        break;
                    }
                }
                if (!foundSimilar) {
                    normalizedWeights.add(weight);
                }
            });
            
            // If still too many, round to nearest 50
            if (normalizedWeights.size > 10) {
                const roundedWeights = new Set<number>();
                numericWeights.forEach(weight => {
                    const rounded = Math.round(weight / 50) * 50;
                    const clamped = Math.max(100, Math.min(900, rounded));
                    roundedWeights.add(clamped);
                });
                font.weights = Array.from(roundedWeights)
                    .sort((a, b) => a - b)
                    .map(w => String(w));
            } else {
                font.weights = Array.from(normalizedWeights)
                    .sort((a, b) => a - b)
                    .map(w => String(w));
            }
        } else {
            // For non-variable fonts, just ensure weights are sorted
            font.weights = numericWeights
                .sort((a, b) => a - b)
                .map(w => String(w));
        }
    });
}

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
