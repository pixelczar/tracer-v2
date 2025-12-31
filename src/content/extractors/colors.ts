import type { ColorInfo } from '../../shared/types';

export async function extractColors(): Promise<ColorInfo[]> {
    const colorMap = new Map<string, number>();

    // 1. Extract from computed styles of visible elements (Area Weighted)
    extractFromComputedStyles(colorMap);

    // 2. Process and normalize
    return processColors(colorMap);
}

function extractFromComputedStyles(colorMap: Map<string, number>) {
    // Scan more elements to ensure we catch smaller accent buttons
    const elements = document.querySelectorAll('body, body *');
    const sampled = Array.from(elements);

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

    // Deduplicate similar colors (keep higher weight)
    const distinct: [string, number][] = [];
    const threshold = 15; // Delta-E threshold approx

    for (const [hex, weight] of sorted) {
        // If we already have a very similar color, skip this one
        const isSimilar = distinct.some(([dHex]) => colorDistance(hex, dHex) < threshold);
        if (!isSimilar) {
            distinct.push([hex, weight]);
        }
    }

    const topColors = distinct.slice(0, 12);
    const maxWeight = topColors[0]?.[1] || 1;

    return topColors.map(([hex, weight]) => ({
        hex,
        weight: weight > maxWeight * 0.5 ? 3 : weight > maxWeight * 0.2 ? 2 : 1,
        source: 'computed' as const,
    }));
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

// Simple RGB distance (Euclidean) - fast enough for this check
function colorDistance(hex1: string, hex2: string) {
    const r1 = parseInt(hex1.slice(1, 3), 16);
    const g1 = parseInt(hex1.slice(3, 5), 16);
    const b1 = parseInt(hex1.slice(5, 7), 16);

    const r2 = parseInt(hex2.slice(1, 3), 16);
    const g2 = parseInt(hex2.slice(3, 5), 16);
    const b2 = parseInt(hex2.slice(5, 7), 16);

    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
}
