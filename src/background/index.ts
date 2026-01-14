import { TECH_PATTERNS } from '../shared/techPatterns';
import { safeSendMessage, safeSendMessageToTab } from '../shared/chromeUtils';

// Get settings from storage (background script can't use localStorage)
async function getSettings(): Promise<{ deepScan: boolean; theme?: 'light' | 'dark' }> {
    try {
        const result = await chrome.storage.local.get('tracer_settings');
        if (result.tracer_settings && typeof result.tracer_settings === 'object') {
            return { 
                deepScan: result.tracer_settings.deepScan || false,
                theme: result.tracer_settings.theme || 'dark'
            };
        }
    } catch (e) {
        console.warn('[Tracer] Failed to load settings:', e);
    }
    return { deepScan: false, theme: 'dark' };
}

// Detect Chrome's color scheme (dark/light toolbar)
async function getChromeColorScheme(): Promise<'light' | 'dark'> {
    try {
        // Try to detect Chrome's theme via chrome.action API or by checking system preference
        // Chrome doesn't expose toolbar theme directly, but we can infer from system preference
        // For now, we'll check if we can detect it, otherwise default to checking the actual icon visibility
        // Since Chrome's toolbar is typically dark in dark mode, we'll use that as default
        return 'dark'; // Default to dark (Chrome's dark mode = dark toolbar = needs white icons)
    } catch {
        return 'dark';
    }
}

// Update extension icon based on Chrome's theme (not extension's theme)
async function updateExtensionIcon(theme: 'light' | 'dark') {
    return new Promise<void>((resolve) => {
        try {
            const iconPaths: Record<number, string> = {};
            
            // Detect Chrome's actual color scheme (dark toolbar vs light toolbar)
            // When Chrome toolbar is DARK → use WHITE icons (favicon.png should be white)
            // When Chrome toolbar is LIGHT → use DARK icons (icon-light-*.png might be dark, but naming is confusing)
            // Since Chrome's dark mode typically means dark toolbar, we need white icons
            // The favicon.png files are likely white, and icon-light-*.png might be incorrectly named
            
            // For dark Chrome toolbar (dark mode Chrome) → use white icons
            // favicon_256.png is white (works in extension management and sidepanel)
            iconPaths[16] = 'src/assets/icons/favicon_256.png';
            iconPaths[32] = 'src/assets/icons/favicon_256.png';
            iconPaths[48] = 'src/assets/icons/favicon_256.png';
            iconPaths[128] = 'src/assets/icons/favicon_256.png';
            
            console.log(`[Tracer] Updating extension icon for theme: ${theme}`);
            console.log(`[Tracer] Icon paths:`, JSON.stringify(iconPaths, null, 2));
            
            // Use callback-based API to properly catch errors
            chrome.action.setIcon({ path: iconPaths }, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    console.error(`[Tracer] Failed to set icon for theme "${theme}":`, error.message);
                    console.error(`[Tracer] Attempted paths:`, iconPaths);
                    
                    // If custom icons fail, try using default icons as fallback
                    // This ensures the extension always has a valid icon
                    console.warn('[Tracer] Custom icons failed, using default icons as fallback');
                    const fallbackPaths = {
                        16: 'src/assets/icons/favicon_256.png',
                        32: 'src/assets/icons/favicon_256.png',
                        48: 'src/assets/icons/favicon_256.png',
                        128: 'src/assets/icons/favicon_256.png'
                    };
                    chrome.action.setIcon({ path: fallbackPaths }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('[Tracer] Fallback icons also failed:', chrome.runtime.lastError.message);
                        } else {
                            console.log('[Tracer] Fallback icons set successfully');
                        }
                        resolve();
                    });
                } else {
                    console.log(`[Tracer] ✓ Successfully updated extension icon for theme: ${theme}`);
                    resolve();
                }
            });
        } catch (e) {
            console.error('[Tracer] Exception updating extension icon:', e);
            resolve();
        }
    });
}

// Enable side panel to open on action click
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

// Initialize icon on startup
getSettings().then(settings => {
    const theme = settings.theme || 'dark';
    console.log(`[Tracer] Initializing extension icon with theme: ${theme}`);
    updateExtensionIcon(theme);
}).catch((e) => {
    console.error('[Tracer] Error initializing icon:', e);
    // Default to light icons on error (Chrome toolbar is typically light)
    updateExtensionIcon('light');
});

// Listen for settings changes to update icon
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.tracer_settings) {
        const newSettings = changes.tracer_settings.newValue;
        const oldSettings = changes.tracer_settings.oldValue;
        if (newSettings && typeof newSettings === 'object' && newSettings.theme) {
            const theme = newSettings.theme as 'light' | 'dark';
            const oldTheme = oldSettings?.theme || 'unknown';
            console.log(`[Tracer] Settings changed: theme ${oldTheme} → ${theme}`);
            updateExtensionIcon(theme);
        }
    }
});

// Clean up tab headers on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.session.remove(`headers_${tabId}`).catch(() => { });
});

// Capture headers
chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
        if (details.type === 'main_frame' && details.responseHeaders && details.tabId !== -1) {
            const headers: Record<string, string> = {};
            details.responseHeaders.forEach(h => {
                if (h.name && h.value) {
                    headers[h.name.toLowerCase()] = h.value;
                }
            });
            chrome.storage.session.set({ [`headers_${details.tabId}`]: headers }).catch(console.error);
        }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders']
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = message.tabId || (sender.tab && sender.tab.id);

    if (message.type === 'START_SCAN' && tabId) {
        handleScan(tabId);
        sendResponse({ ok: true });
    } else if (message.type === 'START_INSPECT' && tabId) {
        handleInspect(tabId);
        sendResponse({ ok: true });
    } else if (message.type === 'STOP_INSPECT' && tabId) {
        handleStopInspect(tabId);
        sendResponse({ ok: true });
    } else if (message.type === 'CAPTURE_ELEMENT' && tabId) {
        handleCapture(tabId, message.rect).then(sendResponse);
        return true;
    } else if (message.type === 'UPDATE_ICON' && message.theme) {
        // Update extension icon when theme changes (also updates side panel header)
        const theme = message.theme as 'light' | 'dark';
        console.log(`[Tracer] Received UPDATE_ICON message with theme: ${theme}`);
        updateExtensionIcon(theme).then(() => {
            sendResponse({ ok: true });
        }).catch((e) => {
            console.warn('[Tracer] Failed to update icon:', e);
            sendResponse({ ok: false });
        });
        return true;
    } else if (message.type === 'SCAN_PROGRESS' || message.type === 'INSPECT_HOVER' || message.type === 'INSPECT_SELECT' || message.type === 'INSPECT_COMPLETE' || message.type === 'INSPECT_ERROR' || message.type === 'CANCEL_INSPECT') {
        // Forward these messages to sidepanel
        safeSendMessage(message);
        return false;
    }
    return false;
});

// Detect Main World results (Bypasses Content Script CSP)
async function detectMainWorld(tabId: number) {
    try {
        const allGlobals = Array.from(new Set(
            TECH_PATTERNS
                .filter(p => p.patterns.globals)
                .flatMap(p => p.patterns.globals!)
        ));

        const versionGlobals = TECH_PATTERNS
            .filter(p => p.versionGlobal)
            .map(p => ({ name: p.name, global: p.versionGlobal! }));

        const results = await chrome.scripting.executeScript({
            target: { tabId },
            world: 'MAIN',
            args: [allGlobals, versionGlobals],
            func: (globalsToCheck: string[], versionsToDetect: { name: string, global: string }[]) => {
                const found: string[] = [];
                const versions: Record<string, string> = {};

                globalsToCheck.forEach(g => {
                    const parts = g.split('.');
                    let curr: any = window;
                    for (const part of parts) {
                        try {
                            if (curr && curr[part] !== undefined) {
                                curr = curr[part];
                            } else {
                                curr = undefined;
                                break;
                            }
                        } catch (e) {
                            curr = undefined;
                            break;
                        }
                    }
                    if (curr !== undefined) found.push(g);
                });

                versionsToDetect.forEach(v => {
                    try {
                        const parts = v.global.split('.');
                        let curr: any = window;
                        for (const part of parts) {
                            curr = curr?.[part];
                        }
                        if (curr && (typeof curr === 'string' || typeof curr === 'number')) {
                            versions[v.name] = String(curr);
                        }
                    } catch (e) { }
                });

                return { foundGlobals: found, versions };
            }
        });
        return results?.[0]?.result || { foundGlobals: [], versions: {} };
    } catch (e) {
        console.error('[Tracer] Main world detection failed:', e);
        return { foundGlobals: [], versions: {} };
    }
}

async function ensureContentScriptLoaded(tabId: number): Promise<boolean> {
    try {
        // Content script is loaded via manifest but stays inactive until activated
        // Send PING to activate it and verify it's loaded
        const response = await safeSendMessageToTab(tabId, { type: 'PING' });

        if (response?.pong) {
            // Content script is loaded and activated
            return true;
        }

        // If PING fails, the content script might not be loaded yet
        // Wait a bit and try again (content scripts load asynchronously)
        await new Promise(r => setTimeout(r, 500));
        const retryResponse = await safeSendMessageToTab(tabId, { type: 'PING' });
        
        if (retryResponse?.pong) {
            return true;
        }

        console.warn('[Tracer] Content script not responding. It may not be loaded on this page yet.');
        return false;
    } catch (e) {
        console.error('[Tracer] Error checking content script:', e);
        return false;
    }
}

async function handleScan(tabId: number) {
    const ready = await ensureContentScriptLoaded(tabId);

    if (!ready) {
        safeSendMessage({
            type: 'SCAN_ERROR',
            payload: { error: 'Content script not loaded. Please refresh the page.' },
        });
        return;
    }

    // 1. Get headers from session storage
    const storageKey = `headers_${tabId}`;
    const storage = await chrome.storage.session.get(storageKey);
    const headers = storage[storageKey] || {};

    // 2. Main world detection
    const mainWorldResults: any = await detectMainWorld(tabId);

    // 3. Get settings for deep scan
    const settings = await getSettings();

    // 4. Content script extraction
    const response = await safeSendMessageToTab(tabId, {
        type: 'EXTRACT',
        payload: {
            headers,
            mainWorldGlobals: mainWorldResults.foundGlobals,
            mainWorldVersions: mainWorldResults.versions,
            deepScan: settings.deepScan
        }
    });

    if (!response) {
        safeSendMessage({
            type: 'SCAN_ERROR',
            payload: { error: 'Failed to extract page data. Extension may have been reloaded.' },
        });
        return;
    }

    safeSendMessage({
        type: 'SCAN_COMPLETE',
        payload: response,
    });
}

async function handleInspect(tabId: number) {
    const ready = await ensureContentScriptLoaded(tabId);
    if (!ready) {
        safeSendMessage({
            type: 'INSPECT_ERROR',
            payload: { error: 'Content script not loaded. Please refresh the page.' },
        });
        return;
    }

    const response = await safeSendMessageToTab(tabId, { type: 'ENTER_INSPECT_MODE' });
    if (!response) {
        console.error('[Tracer] Error entering inspect mode: Extension context may be invalidated');
    }
}

async function handleStopInspect(tabId: number) {
    const response = await safeSendMessageToTab(tabId, { type: 'EXIT_INSPECT_MODE' });
    if (!response) {
        console.error('[Tracer] Error exiting inspect mode: Extension context may be invalidated');
    }
}

async function handleCapture(_tabId: number, rect: any): Promise<string> {
    try {
        const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
        return JSON.stringify({ screenshot: dataUrl, rect });
    } catch (e) {
        return JSON.stringify({ error: 'Capture failed' });
    }
}
