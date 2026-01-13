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
    try {
        const fontMap = new Map<string, FontDetails>();
        const fontNameMap = new Map<string, string>(); // Maps CSS names to actual font names

        // 1. Scan computed styles (collect CSS names first)
        try {
            scanComputedFonts(fontMap, fontNameMap);
        } catch (err) {
            console.warn('[Tracer] Error scanning computed fonts:', err);
        }

        // 2. Check document.fonts API for all loaded fonts (catches fonts not in first 300 elements)
        try {
            detectLoadedFonts(fontMap, fontNameMap);
        } catch (err) {
            console.warn('[Tracer] Error detecting loaded fonts:', err);
        }
        
        // 3. Build a map of CSS font names to actual font names from document.fonts and @font-face
        // Do this after collecting all CSS names
        try {
            await buildFontNameMap(fontNameMap);
        } catch (err) {
            console.warn('[Tracer] Error building font name map:', err);
        }

        // 3. Check for Google Fonts
        try {
            detectGoogleFonts(fontMap);
        } catch (err) {
            console.warn('[Tracer] Error detecting Google fonts:', err);
        }

        // 4. Check for Adobe Fonts
        try {
            detectAdobeFonts(fontMap);
        } catch (err) {
            console.warn('[Tracer] Error detecting Adobe fonts:', err);
        }

        // 5. Detect icon fonts
        try {
            detectIconFonts(fontMap);
        } catch (err) {
            console.warn('[Tracer] Error detecting icon fonts:', err);
        }

        // 6. Extract icon samples for icon fonts
        try {
            extractIconSamples(fontMap);
        } catch (err) {
            console.warn('[Tracer] Error extracting icon samples:', err);
        }

        // 7. Normalize weights for variable fonts
        try {
            normalizeVariableFontWeights(fontMap);
        } catch (err) {
            console.warn('[Tracer] Error normalizing font weights:', err);
        }

        // 8. Generate previews
        const settings = await getSettingsAsync();
        const previewText = getFontPreviewText(settings.fontPreviewSource);
        const fonts = await Promise.all(
            Array.from(fontMap.values()).map(async (details) => {
                try {
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
                } catch (err) {
                    console.warn('[Tracer] Error generating preview for font:', details.family, err);
                    // Return font with fallback preview
                    return {
                        ...details,
                        family: fontNameMap.get(details.family) || details.family,
                        preview: { method: 'canvas' as const, data: '', previews: [], weightPreviews: {}, previewText },
                        isMono: details.isMono,
                        isSerif: details.isSerif,
                        isIconFont: details.isIconFont,
                        iconSamples: details.iconSamples,
                    };
                }
            })
        );

        return fonts.filter(f => !isSystemFont(f.family));
    } catch (err) {
        console.error('[Tracer] Fatal error in extractFonts:', err);
        return []; // Return empty array instead of throwing
    }
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
            if (!document.body) {
                continue; // Skip if document.body is not available
            }
            
            const testEl = document.createElement('span');
            testEl.style.fontFamily = `"${cssName}"`;
            testEl.style.position = 'absolute';
            testEl.style.visibility = 'hidden';
            testEl.style.fontSize = '16px';
            testEl.textContent = 'A';
            
            try {
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
                
                // Clean up test element
                if (document.body.contains(testEl)) {
                    document.body.removeChild(testEl);
                }
            } catch (err) {
                // Clean up test element if appendChild failed or removeChild fails
                if (testEl.parentNode) {
                    try {
                        testEl.parentNode.removeChild(testEl);
                    } catch {
                        // Ignore cleanup errors
                    }
                }
                // Continue to next font if this one fails
                continue;
            }
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
    
    // Google Fonts — use import URL (works in sidepanel via <link> tag)
    if (font.source === 'google') {
        return {
            method: 'google',
            data: `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:wght@${font.weights.join(';')}`,
            previewText: textToUse,
        };
    }

    // Try to extract font as data URI (works in sidepanel - font is embedded)
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
            // CORS blocked - fall through to canvas rendering
        }
    }

    // Render via canvas - captures the font as it appears on the page
    // This is necessary because the sidepanel runs in an isolated context
    // and cannot access fonts loaded on the page via CSS
    const weightPreviews: Record<string, string[]> = {};
    for (const weight of font.weights) {
        const preview = await renderFontToCanvas(font.family, textToUse, font.isMono, font.isSerif, weight);
        if (preview) {
            weightPreviews[weight] = [preview];
        }
    }

    // Return canvas preview if we got any valid renders
    const firstWeightPreviews = weightPreviews[font.weights[0]] || [];
    if (firstWeightPreviews.length > 0) {
        return {
            method: 'canvas',
            data: firstWeightPreviews[0],
            previews: firstWeightPreviews,
            weightPreviews,
            previewText: textToUse,
        };
    }

    // Last resort: try all weights and use any that worked
    const anyPreviews = Object.values(weightPreviews).flat();
    if (anyPreviews.length > 0) {
        return {
            method: 'canvas',
            data: anyPreviews[0],
            previews: anyPreviews,
            weightPreviews,
            previewText: textToUse,
        };
    }

    // Final fallback: return canvas method with empty data
    // The sidepanel will show fallback font, but at least we tried canvas first
    return {
        method: 'canvas',
        data: '',
        previews: [],
        weightPreviews: {},
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

/**
 * Render font preview using SVG foreignObject approach.
 * 
 * Strategy:
 * 1. Try blob URL with crossOrigin anonymous (best font support)
 * 2. Fall back to direct canvas text rendering
 */
async function renderFontToCanvas(family: string, text: string, isMono: boolean, isSerif: boolean, weight: string = '400'): Promise<string> {
    const size = 64;
    const maxWidth = 800;
    const maxLines = 2;
    const lineHeight = size * 1.2;

    // Build font stack with appropriate fallback
    const systemKeywords = ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];
    const isSystemKey = systemKeywords.includes(family);
    const familyQuoted = isSystemKey ? family : `"${family}"`;
    
    let fallback: string;
    if (isMono) {
        fallback = 'monospace';
    } else if (isSerif) {
        fallback = 'serif';
    } else {
        fallback = 'sans-serif';
    }
    const fontStack = `${familyQuoted}, ${fallback}`;

    // Pre-load font
    try {
        await document.fonts.load(`${weight} ${size}px ${familyQuoted}`);
        await document.fonts.ready;
    } catch {
        // Continue anyway
    }

    if (!document.body) {
        return '';
    }

    // Create a container element styled with the font
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: ${maxWidth}px;
        font-family: ${fontStack};
        font-weight: ${weight};
        font-size: ${size}px;
        line-height: ${lineHeight}px;
        color: #000000;
        background: white;
        white-space: normal;
        word-break: break-word;
        display: -webkit-box;
        -webkit-line-clamp: ${maxLines};
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    `;
    container.textContent = text;
    
    try {
        document.body.appendChild(container);
    } catch {
        return '';
    }
    
    // Force reflow and wait for font to render
    void container.offsetHeight;
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Get dimensions
    let width: number, height: number;
    try {
        const rect = container.getBoundingClientRect();
        width = Math.ceil(rect.width) || maxWidth;
        height = Math.ceil(rect.height) || Math.ceil(lineHeight * maxLines);
    } catch {
        width = maxWidth;
        height = Math.ceil(lineHeight * maxLines);
    }
    
    const dpr = window.devicePixelRatio || 1;
    
    // APPROACH 1: Try SVG foreignObject with blob URL
    let svgUrl: string | null = null;
    try {
        // Clone the container for SVG embedding
        const clone = container.cloneNode(true) as HTMLElement;
        clone.style.position = 'static';
        clone.style.left = 'auto';
        clone.style.top = 'auto';
        clone.style.width = `${width}px`;
        clone.style.margin = '0';
        clone.style.padding = '0';
        clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', String(width));
        svg.setAttribute('height', String(height));
        svg.setAttribute('xmlns', svgNS);
        
        const foreignObject = document.createElementNS(svgNS, 'foreignObject');
        foreignObject.setAttribute('width', '100%');
        foreignObject.setAttribute('height', '100%');
        foreignObject.appendChild(clone);
        svg.appendChild(foreignObject);
        
        const svgString = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        svgUrl = URL.createObjectURL(svgBlob);
        
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width * dpr);
        canvas.height = Math.ceil(height * dpr);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No canvas context');
        
        ctx.scale(dpr, dpr);
        
        // Load image and draw to canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const result = await new Promise<string>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Image load timeout'));
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeout);
                try {
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve(dataUrl);
                } catch (e) {
                    reject(e);
                }
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Image load error'));
            };
            
            img.src = svgUrl!;
        });
        
        // Clean up
        URL.revokeObjectURL(svgUrl);
        try { document.body.removeChild(container); } catch { /* ignore */ }
        
        return result;
        
    } catch (svgError) {
        // Clean up blob URL
        if (svgUrl) {
            try { URL.revokeObjectURL(svgUrl); } catch { /* ignore */ }
        }
        
        // APPROACH 2: Direct canvas text rendering
        try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.ceil(maxWidth * dpr);
            canvas.height = Math.ceil(lineHeight * maxLines * dpr);
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                try { document.body.removeChild(container); } catch { /* ignore */ }
                return '';
            }
            
            ctx.scale(dpr, dpr);
            ctx.font = `${weight} ${size}px ${fontStack}`;
            ctx.fillStyle = '#000000';
            ctx.textBaseline = 'top';

            // Word wrap
            const words = text.split(' ');
            const lines: string[] = [];
            let currentLine = words[0] || '';

            for (let i = 1; i < words.length; i++) {
                const testLine = currentLine + ' ' + words[i];
                const testWidth = ctx.measureText(testLine).width;
                
                if (testWidth > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = words[i];
                    if (lines.length >= maxLines) break;
                } else {
                    currentLine = testLine;
                }
            }
            
            if (lines.length < maxLines && currentLine) {
                if (ctx.measureText(currentLine).width > maxWidth) {
                    while (ctx.measureText(currentLine + '...').width > maxWidth && currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                    }
                    currentLine += '...';
                }
                lines.push(currentLine);
            }

            lines.forEach((line, i) => {
                ctx.fillText(line, 0, i * lineHeight);
            });

            // Trim canvas
            const actualHeight = Math.ceil(lines.length * lineHeight);
            const trimmedCanvas = document.createElement('canvas');
            trimmedCanvas.width = canvas.width;
            trimmedCanvas.height = Math.ceil(actualHeight * dpr);
            
            const trimCtx = trimmedCanvas.getContext('2d');
            if (trimCtx) {
                trimCtx.drawImage(canvas, 0, 0);
            }

            // Clean up
            try { document.body.removeChild(container); } catch { /* ignore */ }
            
            return trimmedCanvas.toDataURL('image/png');
            
        } catch (canvasError) {
            // Clean up
            try { document.body.removeChild(container); } catch { /* ignore */ }
            
            // Log only for non-system fonts
            if (!isSystemKey) {
                console.warn('[Tracer] renderFontToCanvas failed for', family, ':', 
                    (canvasError instanceof Error) ? canvasError.message : String(canvasError));
            }
            return '';
        }
    }
}

const SYSTEM_FONTS = [
    // Generic font families (CSS keywords) - these are not actual fonts
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
    // System font keywords - these resolve to platform fonts
    'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded',
    // Browser-specific system font keywords
    '-apple-system', 'blinkmacsystemfont',
    // CSS keywords that aren't font names
    'initial', 'inherit', 'unset', 'revert',
];

function normalizeVariableFontWeights(fontMap: Map<string, FontDetails>) {
    // Standard font weights: 100, 200, 300, 400, 500, 600, 700, 800, 900
    const STANDARD_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    
    fontMap.forEach((font, _family) => {
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
