import { extractColors } from './extractors/colors';
import { extractFonts } from './extractors/fonts';
import { extractTech } from './extractors/tech';
import { enterInspectMode, exitInspectMode } from './inspect/highlighter';
import { safeSendMessage, safeAddMessageListener, isExtensionContextValid } from '../shared/chromeUtils';

// Content script is loaded but stays inactive until activated by extension
// This prevents it from running on all pages automatically
let isActivated = false;

// Check if we should activate - only activate if we receive a PING from background
// This means the extension was explicitly opened by the user

// Global error handler to catch any uncaught extension context errors
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        const errorMsg = event.message || String(event.error);
        if (errorMsg.includes('Extension context invalidated') ||
            errorMsg.includes('message port closed')) {
            // Suppress these errors - they're expected when extension reloads
            event.preventDefault();
            return false;
        }
    }, true);
}

// Create cursor bubble overlay on the page
let cursorBubble: HTMLElement | null = null;
let targetX = -100;
let targetY = -100;
let currentX = -100;
let currentY = -100;
let animationFrame: number | null = null;

function createCursorBubble() {
    if (cursorBubble && document.body.contains(cursorBubble)) return;

    cursorBubble = document.createElement('div');
    cursorBubble.id = 'tracer-cursor-bubble';
    cursorBubble.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 2147483647;
    background: #0a0a0a;
    color: #f0f0f0;
    padding: 6px 12px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 9999px;
    opacity: 0;
    white-space: nowrap;
    transition: opacity 0.1s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
  `;
    document.body.appendChild(cursorBubble);
    console.log('[Tracer] Cursor bubble created');

    // Start animation loop
    if (!animationFrame) {
        startCursorAnimation();
    }
}

function startCursorAnimation() {
    const animate = () => {
        // Smooth lerp interpolation - faster to reduce lag
        const lerp = 0.5;
        currentX += (targetX - currentX) * lerp;
        currentY += (targetY - currentY) * lerp;

        if (cursorBubble) {
            cursorBubble.style.left = `${currentX + 12}px`;
            cursorBubble.style.top = `${currentY + 12}px`;
        }

        animationFrame = requestAnimationFrame(animate);
    };
    animate();
}

function updateCursorPosition(e: MouseEvent) {
    targetX = e.clientX;
    targetY = e.clientY;
}

let underscoreBlinkInterval: number | null = null;
let showUnderscore = true;

function startUnderscoreBlink() {
    if (underscoreBlinkInterval) return;
    showUnderscore = true;
    underscoreBlinkInterval = window.setInterval(() => {
        showUnderscore = !showUnderscore;
        if (cursorBubble && cursorBubble.innerHTML.includes('//')) {
            const underscoreSpan = cursorBubble.querySelector('span');
            if (underscoreSpan) {
                underscoreSpan.style.opacity = showUnderscore ? '1' : '0';
            }
        }
    }, 530);
}

function stopUnderscoreBlink() {
    if (underscoreBlinkInterval) {
        clearInterval(underscoreBlinkInterval);
        underscoreBlinkInterval = null;
    }
    showUnderscore = true;
}

function showCursorBubble(message: string) {
    createCursorBubble();
    if (cursorBubble) {
        if (message === '//_') {
            cursorBubble.innerHTML = '//<span style="opacity: 1; color: #eaff00; letter-spacing: -0.1em;">_</span>';
            cursorBubble.style.textTransform = 'none';
            startUnderscoreBlink();
        } else {
            cursorBubble.textContent = message;
            cursorBubble.style.textTransform = 'uppercase';
            stopUnderscoreBlink();
        }
        cursorBubble.style.opacity = '1';
    }
    document.addEventListener('mousemove', updateCursorPosition);
    console.log('[Tracer] Showing cursor bubble:', message);
}

function hideCursorBubble() {
    if (cursorBubble) {
        cursorBubble.style.opacity = '0';
    }
    stopUnderscoreBlink();
    document.removeEventListener('mousemove', updateCursorPosition);
}

function updateCursorMessage(message: string) {
    if (cursorBubble) {
        if (message === '//_') {
            cursorBubble.innerHTML = `//<span style="opacity: ${showUnderscore ? 1 : 0}; color: #eaff00; letter-spacing: -0.1em;">_</span>`;
            cursorBubble.style.textTransform = 'none';
            startUnderscoreBlink();
        } else {
            cursorBubble.textContent = message;
            cursorBubble.style.textTransform = 'uppercase';
            stopUnderscoreBlink();
        }
    }
}

// Message listener
safeAddMessageListener((message, _sender, sendResponse) => {
    if (!isExtensionContextValid()) {
        return false;
    }

    switch (message.type) {
        case 'PING':
            // Activate on first ping (when extension is opened)
            isActivated = true;
            // Respond to ping to confirm content script is loaded
            sendResponse({ pong: true });
            return true;

        case 'EXTRACT':
            // Only process if activated
            if (!isActivated) {
                sendResponse(null);
                return false;
            }
            console.log('[Tracer] Content script received message:', message.type);
            // Cursor message will be set by extension via UPDATE_CURSOR
            runFullExtraction(message.payload).then((result) => {
                sendResponse(result);
            }).catch((err) => {
                console.error('[Tracer] Extraction error:', err);
                sendResponse(null);
            });
            return true;

        case 'ENTER_INSPECT_MODE':
            // Only process if activated
            if (!isActivated) {
                sendResponse({ ok: false });
                return false;
            }
            console.log('[Tracer] Content script received message:', message.type);
            // Cursor message will be set by extension via UPDATE_CURSOR
            enterInspectMode((element) => {
                safeSendMessage({ type: 'INSPECT_SELECT' });
                // Analyze element and send back
                import('./inspect/analyzer').then(({ analyzeElement }) => {
                    analyzeElement(element).then((result) => {
                        exitInspectMode(); // Force exit immediately
                        safeSendMessage({ type: 'INSPECT_COMPLETE', payload: result });
                    }).catch((err) => {
                        console.error('[Tracer] Analyze error:', err);
                        exitInspectMode();
                    });
                });
            });
            sendResponse({ ok: true });
            return true;

        case 'EXIT_INSPECT_MODE':
            if (!isActivated) {
                sendResponse({ ok: false });
                return false;
            }
            hideCursorBubble();
            exitInspectMode();
            sendResponse({ ok: true });
            return true;

        case 'SHOW_CURSOR':
            if (!isActivated) {
                sendResponse({ ok: false });
                return false;
            }
            showCursorBubble(message.message || '');
            sendResponse({ ok: true });
            return true;

        case 'HIDE_CURSOR':
            if (!isActivated) {
                sendResponse({ ok: false });
                return false;
            }
            hideCursorBubble();
            sendResponse({ ok: true });
            return true;

        case 'UPDATE_CURSOR':
            if (!isActivated) {
                sendResponse({ ok: false });
                return false;
            }
            updateCursorMessage(message.message || '');
            sendResponse({ ok: true });
            return true;

        default:
            return false;
    }
});

async function runFullExtraction(payload: any = {}) {
    console.log('[Tracer] Running full extraction');

    safeSendMessage({ type: 'SCAN_PROGRESS', payload: { status: 'Analyzing Colors' } });
    const colors = await extractColors();

    safeSendMessage({ type: 'SCAN_PROGRESS', payload: { status: 'Tracing Typography' } });
    const fonts = await extractFonts();

    safeSendMessage({ type: 'SCAN_PROGRESS', payload: { status: 'Detecting Tech' } });
    const tech = await extractTech({
        headers: payload.headers,
        mainWorldGlobals: payload.mainWorldGlobals,
        mainWorldVersions: payload.mainWorldVersions,
        cookies: document.cookie,
        deepScan: payload.deepScan || false
    });

    console.log('[Tracer] Extraction complete:', { colors: colors.length, fonts: fonts.length, tech: tech.length });

    const result = {
        url: window.location.href,
        domain: window.location.hostname,
        favicon: getFavicon(),
        ogImage: getOGImage(),
        ogMetadata: extractOGMetadata(),
        colors,
        fonts,
        tech,
        inspectedElements: [],
    };

    return result;
}

function getFavicon(): string | undefined {
    const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
    return link?.href;
}

function getOGImage(): string | undefined {
    const meta = document.querySelector<HTMLMetaElement>('meta[property="og:image"]') ||
        document.querySelector<HTMLMetaElement>('meta[name="og:image"]') ||
        document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]') ||
        document.querySelector<HTMLMetaElement>('meta[property="twitter:image"]');
    return meta?.content;
}

function extractOGMetadata() {
    const getMeta = (property: string, name?: string) => {
        const meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`) ||
            (name ? document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`) : null);
        return meta?.content;
    };

    return {
        title: getMeta('og:title'),
        description: getMeta('og:description'),
        type: getMeta('og:type'),
        url: getMeta('og:url'),
        siteName: getMeta('og:site_name', 'og:site_name'),
    };
}

// Content script loads but stays inactive until activated by extension
// This prevents it from running on all pages automatically
// It will only activate when the user clicks the extension icon
