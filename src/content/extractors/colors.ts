import type { ColorInfo } from '../../shared/types';

interface ColorMetadata {
    weight: number;
    isAccent: boolean;
    isPrimaryButton: boolean;
    isNearExtreme: boolean;
}

export async function extractColors(): Promise<ColorInfo[]> {
    const colorMap = new Map<string, ColorMetadata>();

    // 1. Extract from computed styles of visible elements (Area Weighted)
    extractFromComputedStyles(colorMap);

    // 2. Process and normalize
    return processColors(colorMap);
}

function extractFromComputedStyles(colorMap: Map<string, ColorMetadata>) {
    // Scan more elements to ensure we catch smaller accent buttons, but limit for performance
    const elements = document.querySelectorAll('body, body *');
    const sampled = Array.from(elements).slice(0, 3000);

    sampled.forEach(el => {
        // Skip Tracer extension's own elements
        if (isTracerElement(el)) return;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Area is a proxy for visual impact
        // Cap the area to avoid massive backgrounds drowning out everything (e.g. hero sections)
        const area = Math.min(rect.width * rect.height, 100000);

        const computed = getComputedStyle(el);
        
        // Detect if this is a button, especially a primary button
        const isButton = el.tagName === 'BUTTON' || 
                        el.getAttribute('role') === 'button' ||
                        el.classList.toString().toLowerCase().includes('button') ||
                        el.classList.toString().toLowerCase().includes('btn');
        
        const classList = el.classList.toString().toLowerCase();
        const isPrimaryButton = isButton && (
            classList.includes('primary') ||
            classList.includes('cta') ||
            classList.includes('accent') ||
            classList.includes('highlight') ||
            el.getAttribute('data-variant') === 'primary' ||
            el.getAttribute('data-type') === 'primary'
        );

        // Check element classes/attributes for accent/primary indicators
        // This helps catch colors used for accents even if not on buttons
        const hasAccentIndicator = 
            classList.includes('accent') ||
            classList.includes('primary') ||
            classList.includes('brand') ||
            classList.includes('highlight') ||
            classList.includes('cta') ||
            el.getAttribute('data-accent') !== null ||
            el.getAttribute('data-primary') !== null;
        
        // Also check if the color itself is colorful (saturated) - these are likely accents
        const bgHex = normalizeToHex(computed.backgroundColor);
        const isAccentColor = bgHex ? isColorful(bgHex) : false;

        // Background Color
        const bg = computed.backgroundColor;
        if (isValidColor(bg)) {
            const hex = normalizeToHex(bg);
            if (hex) {
                // Backgrounds get full area weight
                // Buttons (especially primary) get extra boost
                let weight = area;
                if (isPrimaryButton) {
                    weight *= 50; // Massive boost for primary buttons
                } else if (isButton) {
                    weight *= 10; // Boost for any button
                }
                // Boost if element has accent indicators or color is colorful
                const isAccent = hasAccentIndicator || (isAccentColor && !isNearWhiteOrBlack(hex));
                addWeight(colorMap, hex, weight, isAccent, isPrimaryButton);
            }
        }

        // Text Color - heavily reduced since text nodes are boring
        const color = computed.color;
        if (isValidColor(color)) {
            const hex = normalizeToHex(color);
            if (hex) {
                // Text gets minimal weight - we don't want to prioritize text colors
                // Only boost if it's on a button or has accent indicators
                let weight = area * 0.01; // Much less than before
                if (isPrimaryButton || hasAccentIndicator) {
                    weight *= 20; // Boost accent/button text colors
                }
                addWeight(colorMap, hex, weight, hasAccentIndicator, false);
            }
        }

        // Border Color
        const border = computed.borderColor;
        if (isValidColor(border) && parseFloat(computed.borderWidth) > 0) {
            const hex = normalizeToHex(border);
            if (hex) {
                // Borders are thin, but boost if on buttons
                let weight = area * 0.02;
                if (isPrimaryButton) {
                    weight *= 10;
                }
                addWeight(colorMap, hex, weight, hasAccentIndicator, false);
            }
        }

        // SVG Fill/Stroke
        if (el instanceof SVGElement) {
            const fill = computed.fill;
            if (isValidColor(fill)) {
                const hex = normalizeToHex(fill);
                if (hex) {
                    addWeight(colorMap, hex, area, false, false);
                }
            }
            const stroke = computed.stroke;
            if (isValidColor(stroke)) {
                const hex = normalizeToHex(stroke);
                if (hex) {
                    addWeight(colorMap, hex, area * 0.1, false, false);
                }
            }
        }
    });
}


function addWeight(
    map: Map<string, ColorMetadata>, 
    hex: string, 
    weight: number,
    isAccentVar: boolean,
    isPrimaryButton: boolean
) {
    const isNearExtreme = isNearWhiteOrBlack(hex);
    
    // Reduce weight of near-white/black significantly
    if (isNearExtreme) {
        weight *= 0.05; // Even more reduction
    } else if (isColorful(hex)) {
        // Boost saturated colors (accents)
        weight *= 15; // Slightly reduced from 20 since we have other boosts now
    }
    
    // Massive boost for accent variables or primary button colors
    if (isAccentVar || isPrimaryButton) {
        weight *= 100; // Huge boost to ensure these are prioritized
    }

    const existing = map.get(hex);
    if (existing) {
        // Merge metadata - if any occurrence is accent/primary, mark it as such
        existing.weight += weight;
        existing.isAccent = existing.isAccent || isAccentVar;
        existing.isPrimaryButton = existing.isPrimaryButton || isPrimaryButton;
    } else {
        map.set(hex, {
            weight,
            isAccent: isAccentVar,
            isPrimaryButton: isPrimaryButton,
            isNearExtreme
        });
    }
}

function isValidColor(c: string) {
    return c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)';
}

function processColors(colorMap: Map<string, ColorMetadata>): ColorInfo[] {
    const sorted = Array.from(colorMap.entries())
        .sort((a, b) => {
            // Prioritize accent/primary colors even if weight is slightly lower
            const aBoost = (a[1].isAccent || a[1].isPrimaryButton) ? 1000000 : 0;
            const bBoost = (b[1].isAccent || b[1].isPrimaryButton) ? 1000000 : 0;
            return (b[1].weight + bBoost) - (a[1].weight + aBoost);
        });

    // Deduplicate similar colors (merge weights into the most prominent one)
    const distinct: [string, ColorMetadata][] = [];

    for (const [hex, metadata] of sorted) {
        // Find if there's a similar color already in distinct
        const similarIndex = distinct.findIndex(([dHex, dMetadata]) => {
            const distance = colorDistance(hex, dHex);
            // Use adaptive threshold based on color brightness
            // Near-white/black colors need much stricter threshold (smaller distance)
            const brightness1 = getBrightness(hex);
            const brightness2 = getBrightness(dHex);
            const isNearExtreme1 = brightness1 > 240 || brightness1 < 20;
            const isNearExtreme2 = brightness2 > 240 || brightness2 < 20;
            
            // If either color is near extreme, use very strict threshold
            if (isNearExtreme1 || isNearExtreme2) {
                // For near-black: threshold of 5 (catches #000000 vs #0A0A0A)
                // For near-white: threshold of 10 (catches #FFFFFF vs #F0F0F0)
                const threshold = brightness1 < 20 || brightness2 < 20 ? 5 : 10;
                return distance < threshold;
            }
            
            // For mid-range colors, use standard threshold
            return distance < 15;
        });

        if (similarIndex >= 0) {
            // Merge weight and metadata into the existing similar color
            const existing = distinct[similarIndex][1];
            existing.weight += metadata.weight;
            existing.isAccent = existing.isAccent || metadata.isAccent;
            existing.isPrimaryButton = existing.isPrimaryButton || metadata.isPrimaryButton;
            // Keep the more extreme isNearExtreme (if either is extreme, mark as extreme)
            existing.isNearExtreme = existing.isNearExtreme || metadata.isNearExtreme;
        } else {
            distinct.push([hex, { ...metadata }]);
        }
    }

    // Re-sort after merging weights
    distinct.sort((a, b) => {
        const aBoost = (a[1].isAccent || a[1].isPrimaryButton) ? 1000000 : 0;
        const bBoost = (b[1].isAccent || b[1].isPrimaryButton) ? 1000000 : 0;
        return (b[1].weight + bBoost) - (a[1].weight + aBoost);
    });

    const topColors = distinct.slice(0, 12);
    const maxWeight = topColors[0]?.[1].weight || 1;

    // Limit weight 3 (large swatches) to top colors
    // Prioritize accent/primary colors, but NEVER allow near-white/black to be large
    let weight3Count = 0;
    const maxWeight3 = 2; // Maximum number of weight 3 colors

    return topColors.map(([hex, metadata]) => {
        let assignedWeight: number;
        
        // NEVER assign weight 3 to near-white/black colors
        const canBeLarge = !metadata.isNearExtreme;
        
        // Prioritize accent/primary colors for large swatches
        const isPriorityColor = metadata.isAccent || metadata.isPrimaryButton;
        
        if (canBeLarge && weight3Count < maxWeight3) {
            // If it's a priority color, give it weight 3 even if weight is lower
            if (isPriorityColor || metadata.weight > maxWeight * 0.4) {
                assignedWeight = 3;
                weight3Count++;
            } else if (metadata.weight > maxWeight * 0.6) {
                assignedWeight = 3;
                weight3Count++;
            } else if (metadata.weight > maxWeight * 0.2) {
                assignedWeight = 2;
            } else {
                assignedWeight = 1;
            }
        } else if (metadata.weight > maxWeight * 0.2) {
            assignedWeight = 2;
        } else {
            assignedWeight = 1;
        }

        return {
            hex,
            weight: assignedWeight,
            source: 'computed' as const,
        };
    });
}

function normalizeToHex(color: string): string | null {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return null;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function isNearWhiteOrBlack(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // More strict range - exclude near-white and near-black from being large
    // This catches colors like #F5F5F5, #0A0A0A, etc.
    return brightness > 240 || brightness < 20;
}

function isColorful(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    // Saturation roughly
    return delta > 30;
}

// Improved color distance calculation
// Uses weighted RGB distance that better approximates perceptual difference
function colorDistance(hex1: string, hex2: string): number {
    const r1 = parseInt(hex1.slice(1, 3), 16);
    const g1 = parseInt(hex1.slice(3, 5), 16);
    const b1 = parseInt(hex1.slice(5, 7), 16);

    const r2 = parseInt(hex2.slice(1, 3), 16);
    const g2 = parseInt(hex2.slice(3, 5), 16);
    const b2 = parseInt(hex2.slice(5, 7), 16);

    // Weighted RGB distance (human eye is more sensitive to green)
    // This better approximates perceptual difference than simple Euclidean
    const dr = r2 - r1;
    const dg = g2 - g1;
    const db = b2 - b1;
    
    // Use weighted distance: green weighted more heavily (human eye sensitivity)
    return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
}

function getBrightness(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Standard brightness calculation
    return (r * 299 + g * 587 + b * 114) / 1000;
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
