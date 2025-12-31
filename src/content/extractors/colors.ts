import type { ColorInfo } from '../../shared/types';

export async function extractColors(): Promise<ColorInfo[]> {
    const colorMap = new Map<string, number>();

    // 1. Extract from stylesheets
    extractFromStylesheets(colorMap);

    // 2. Extract from computed styles of visible elements
    extractFromComputedStyles(colorMap);

    // 3. Convert to array and calculate weights
    return processColors(colorMap);
}

function extractFromStylesheets(colorMap: Map<string, number>) {
    const colorRegex = /#([0-9a-fA-F]{3,8})\b|rgb\([\d\s,]+\)|rgba\([\d\s,.]+\)|hsl\([\d\s%,]+\)|hsla\([\d\s%,.]+\)/g;

    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule instanceof CSSStyleRule) {
                    const matches = rule.cssText.match(colorRegex) || [];
                    matches.forEach(color => {
                        const hex = normalizeToHex(color);
                        if (hex && !isNearWhiteOrBlack(hex)) {
                            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
                        }
                    });
                }
            }
        } catch {
            // CORS blocked stylesheet, skip
        }
    }
}

function extractFromComputedStyles(colorMap: Map<string, number>) {
    const elements = document.querySelectorAll('*');
    const sampled = Array.from(elements).slice(0, 500); // Limit for performance

    const colorProps = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'] as const;

    sampled.forEach(el => {
        const computed = getComputedStyle(el);
        colorProps.forEach(prop => {
            const value = computed[prop];
            if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
                const hex = normalizeToHex(value);
                if (hex) {
                    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
                }
            }
        });
    });
}

function processColors(colorMap: Map<string, number>): ColorInfo[] {
    const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12); // Top 12 colors

    const maxCount = sorted[0]?.[1] || 1;

    return sorted.map(([hex, count]) => ({
        hex,
        weight: count > maxCount * 0.5 ? 3 : count > maxCount * 0.2 ? 2 : 1,
        source: 'computed' as const,
    }));
}

function normalizeToHex(color: string): string | null {
    // Convert rgb/rgba/hsl to hex
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function isNearWhiteOrBlack(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 250 || brightness < 5;
}
