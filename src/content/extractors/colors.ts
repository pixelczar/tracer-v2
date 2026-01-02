import type { ColorInfo } from '../../shared/types';

export async function extractColors(): Promise<ColorInfo[]> {
    const colorMap = new Map<string, number>();

    // 1. Extract from computed styles of visible elements (Area Weighted)
    extractFromComputedStyles(colorMap);

    // 2. Process and normalize
    return processColors(colorMap);
}

function extractFromComputedStyles(colorMap: Map<string, number>) {
    // Scan more elements to ensure we catch smaller accent buttons, but limit for performance
    const elements = document.querySelectorAll('body, body *');
    const sampled = Array.from(elements).slice(0, 3000);

    sampled.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Area is a proxy for visual impact
        // Cap the area to avoid massive backgrounds drowning out everything (e.g. hero sections)
        const area = Math.min(rect.width * rect.height, 100000);

        const computed = getComputedStyle(el);

        // Background Color
        const bg = computed.backgroundColor;
        if (isValidColor(bg)) {
            const hex = normalizeToHex(bg);
            if (hex) {
                // Backgrounds get full area weight
                addWeight(colorMap, hex, area);
            }
        }

        // Text Color
        const color = computed.color;
        if (isValidColor(color)) {
            const hex = normalizeToHex(color);
            if (hex) {
                // Text gets much less weight relative to its box size, but we boost it if it's large text
                // 0.05 roughly estimates text coverage vs box area
                addWeight(colorMap, hex, area * 0.05);
            }
        }

        // Border Color
        const border = computed.borderColor;
        if (isValidColor(border) && parseFloat(computed.borderWidth) > 0) {
            const hex = normalizeToHex(border);
            if (hex) {
                // Borders are thin
                addWeight(colorMap, hex, area * 0.02);
            }
        }

        // SVG Fill/Stroke
        if (el instanceof SVGElement) {
            const fill = computed.fill;
            if (isValidColor(fill)) addWeight(colorMap, normalizeToHex(fill)!, area);
            const stroke = computed.stroke;
            if (isValidColor(stroke)) addWeight(colorMap, normalizeToHex(stroke)!, area * 0.1);
        }
    });
}

function addWeight(map: Map<string, number>, hex: string, weight: number) {
    if (isNearWhiteOrBlack(hex)) {
        // Reduce weight of pure blacks/whites significantly so they don't dominate
        weight *= 0.1;
    } else if (isColorful(hex)) {
        // Boost saturated colors (accents)
        weight *= 20;
    }

    map.set(hex, (map.get(hex) || 0) + weight);
}

function isValidColor(c: string) {
    return c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)';
}

function processColors(colorMap: Map<string, number>): ColorInfo[] {
    const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1]);

    // Deduplicate similar colors (merge weights into the most prominent one)
    const distinct: [string, number][] = [];

    for (const [hex, weight] of sorted) {
        // Find if there's a similar color already in distinct
        const similarIndex = distinct.findIndex(([dHex]) => {
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
            // Merge weight into the existing similar color
            distinct[similarIndex][1] += weight;
        } else {
            distinct.push([hex, weight]);
        }
    }

    // Re-sort after merging weights
    distinct.sort((a, b) => b[1] - a[1]);

    const topColors = distinct.slice(0, 12);
    const maxWeight = topColors[0]?.[1] || 1;

    // Limit weight 3 (large swatches) to top 2-3 colors to avoid too many large swatches
    // Use stricter threshold: top 2 colors OR colors > 60% of max weight
    let weight3Count = 0;
    const maxWeight3 = 2; // Maximum number of weight 3 colors

    return topColors.map(([hex, weight]) => {
        let assignedWeight: number;
        
        if (weight > maxWeight * 0.6 && weight3Count < maxWeight3) {
            assignedWeight = 3;
            weight3Count++;
        } else if (weight > maxWeight * 0.2) {
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
    // Strict range for background noise
    return brightness > 245 || brightness < 15;
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
