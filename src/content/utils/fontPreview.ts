import type { FontPreview } from '@/shared/types';

/**
 * Generate a preview for a font
 * Placeholder implementation - full logic in Prompt 2
 */
export function generateFontPreview(family: string, source: string): FontPreview {
    // For Google fonts, we can use the family name directly
    if (source === 'google') {
        return {
            method: 'google',
            data: family,
        };
    }

    // For custom fonts, we'll need to generate a canvas preview
    return {
        method: 'canvas',
        data: family,
    };
}

/**
 * Render font preview to canvas and return data URI
 */
export function renderFontToCanvas(family: string, text: string = 'Aa'): string {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    ctx.fillStyle = '#000';
    ctx.font = `24px "${family}", sans-serif`;
    ctx.fillText(text, 10, 30);

    return canvas.toDataURL('image/png');
}
