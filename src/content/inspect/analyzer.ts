import type { InspectedElement, TechInfo } from '../../shared/types';
import { safeSendMessagePromise } from '../../shared/chromeUtils';

export async function analyzeElement(el: Element): Promise<InspectedElement> {
    const rect = el.getBoundingClientRect();

    // Request screenshot from background
    const captureResponse = await safeSendMessagePromise({
        type: 'CAPTURE_ELEMENT',
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    });

    if (!captureResponse) {
        throw new Error('Failed to capture screenshot: Extension context may be invalidated');
    }

    const { screenshot, rect: captureRect } = JSON.parse(captureResponse);
    const croppedScreenshot = await cropScreenshot(screenshot, captureRect);

    // Analyze element
    const tech = detectElementTech(el);
    const styles = extractElementStyles(el);
    const attributes = extractRelevantAttributes(el);

    return {
        id: crypto.randomUUID(),
        screenshot: croppedScreenshot,
        selector: getUniqueSelector(el),
        tagName: el.tagName.toLowerCase(),
        rect: {
            top: rect.top,
            left: rect.left,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
        },
        attributes,
        tech,
        styles,
        inspectedAt: Date.now(),
    };
}

async function cropScreenshot(dataUrl: string, rect: { top: number; left: number; width: number; height: number }): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(
                img,
                rect.left * dpr, rect.top * dpr, rect.width * dpr, rect.height * dpr,
                0, 0, rect.width * dpr, rect.height * dpr
            );

            resolve(canvas.toDataURL('image/png'));
        };
        img.src = dataUrl;
    });
}

function detectElementTech(el: Element): TechInfo[] {
    const tech: TechInfo[] = [];
    const htmlEl = el as HTMLElement;

    // Canvas / WebGL
    if (el.tagName === 'CANVAS') {
        const canvas = el as HTMLCanvasElement;

        // Try to detect WebGL
        try {
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (gl) {
                tech.push({
                    name: 'WebGL',
                    confidence: 100,
                    category: 'webgl',
                    isSignal: true,
                    url: '#',
                });
            }
        } catch {
            // Ignore
        }

        // Three.js
        const engine = htmlEl.dataset.engine || htmlEl.getAttribute('data-engine') || '';
        if (engine.includes('three') || el.className.includes('three')) {
            const version = engine.match(/r(\d+)/)?.[1];
            tech.push({
                name: 'Three.js',
                version: version ? `r${version}` : undefined,
                confidence: 100,
                category: 'webgl',
                isSignal: true,
                url: 'https://threejs.org',
            });
        }

        // Spline
        if (htmlEl.dataset.spline || el.closest('[data-spline]')) {
            tech.push({
                name: 'Spline',
                confidence: 100,
                category: 'webgl',
                isSignal: true,
                url: 'https://spline.design',
            });
        }
    }

    // Lottie
    if (el.tagName === 'LOTTIE-PLAYER' || el.tagName === 'DOTLOTTIE-PLAYER') {
        tech.push({
            name: 'Lottie',
            confidence: 100,
            category: 'animation',
            isSignal: true,
            url: 'https://lottiefiles.com',
        });
    }

    // Rive
    if (htmlEl.dataset.rive || el.className.includes('rive')) {
        tech.push({
            name: 'Rive',
            confidence: 100,
            category: 'animation',
            isSignal: true,
            url: 'https://rive.app',
        });
    }

    // Framer Motion
    if (htmlEl.dataset.framerAppearId) {
        tech.push({
            name: 'Framer Motion',
            confidence: 100,
            category: 'animation',
            isSignal: true,
            url: 'https://motion.dev',
        });
    }

    // GSAP — check for _gsap property
    if ((el as HTMLElement & { _gsap?: unknown })._gsap) {
        tech.push({
            name: 'GSAP',
            confidence: 100,
            category: 'animation',
            isSignal: true,
            url: 'https://gsap.com',
        });
    }

    // Video element
    if (el.tagName === 'VIDEO') {
        const video = el as HTMLVideoElement;
        tech.push({
            name: 'Video',
            confidence: 100,
            category: 'miscellaneous',
            isSignal: false,
            url: '#',
        });

        // Check source
        const src = video.src || video.querySelector('source')?.src || '';
        if (src.includes('vimeo')) {
            tech.push({ name: 'Vimeo', confidence: 100, category: 'miscellaneous', isSignal: false, url: 'https://vimeo.com' });
        }
        if (src.includes('youtube') || src.includes('youtu.be')) {
            tech.push({ name: 'YouTube', confidence: 100, category: 'miscellaneous', isSignal: false, url: 'https://youtube.com' });
        }
    }

    // SVG animations
    if (el.tagName === 'SVG' || el.closest('svg')) {
        const svg = el.tagName === 'SVG' ? el : el.closest('svg')!;
        if (svg.querySelector('animate, animateTransform, animateMotion')) {
            tech.push({
                name: 'SVG Animation (SMIL)',
                confidence: 100,
                category: 'animation',
                isSignal: false,
                url: '#',
            });
        }
    }

    // Check for CSS animations
    const computed = getComputedStyle(el);
    if (computed.animation && computed.animation !== 'none') {
        tech.push({
            name: 'CSS Animation',
            confidence: 100,
            category: 'animation',
            isSignal: false,
            url: '#',
        });
    }

    return tech;
}

function extractElementStyles(el: Element): InspectedElement['styles'] {
    const computed = getComputedStyle(el);

    return {
        animations: computed.animation !== 'none' ? [computed.animation] : [],
        transforms: computed.transform !== 'none' ? [computed.transform] : [],
        filters: computed.filter !== 'none' ? [computed.filter] : [],
        blendModes: computed.mixBlendMode !== 'normal' ? [computed.mixBlendMode] : [],
    };
}

function extractRelevantAttributes(el: Element): Record<string, string> {
    const attrs: Record<string, string> = {};
    const interesting = ['class', 'id', 'data-engine', 'data-spline', 'data-framer-appear-id', 'data-rive'];

    interesting.forEach(name => {
        const value = el.getAttribute(name);
        if (value) attrs[name] = value;
    });

    return attrs;
}

function getUniqueSelector(el: Element): string {
    if (el.id) return `#${el.id}`;

    const path: string[] = [];
    let current: Element | null = el;

    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();

        if (current.className && typeof current.className === 'string') {
            const firstClass = current.className.split(' ')[0];
            if (firstClass) selector += `.${firstClass}`;
        }

        path.unshift(selector);
        current = current.parentElement;
    }

    return path.slice(-3).join(' > ');
}
