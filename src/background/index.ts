import { TECH_PATTERNS } from '../shared/techPatterns';

// Enable side panel to open on action click
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

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
    } else if (message.type === 'START_INSPECT' && tabId) {
        handleInspect(tabId);
    } else if (message.type === 'STOP_INSPECT' && tabId) {
        handleStopInspect(tabId);
    } else if (message.type === 'CAPTURE_ELEMENT' && tabId) {
        handleCapture(tabId, message.rect).then(sendResponse);
        return true;
    }
    return true;
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
        const response: any = await new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, { type: 'PING' }, (resp) => {
                if (chrome.runtime.lastError) resolve(null);
                else resolve(resp);
            });
        });

        if (response?.pong) return true;

        // Attempt manual injection if PING failed
        console.log('[Tracer] Content script missing, attempting manual injection...');
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['src/content/index.ts'] // Vite will handle this in dev or build
        });

        // Wait a bit and try PING one last time
        await new Promise(r => setTimeout(r, 200));
        const finalResponse: any = await new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, { type: 'PING' }, (resp) => {
                if (chrome.runtime.lastError) resolve(null);
                else resolve(resp);
            });
        });
        return !!finalResponse?.pong;
    } catch (e) {
        console.error('[Tracer] Injection failed:', e);
        return false;
    }
}

async function handleScan(tabId: number) {
    const ready = await ensureContentScriptLoaded(tabId);

    if (!ready) {
        chrome.runtime.sendMessage({
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

    // 3. Content script extraction
    chrome.tabs.sendMessage(tabId, {
        type: 'EXTRACT',
        payload: {
            headers,
            mainWorldGlobals: mainWorldResults.foundGlobals,
            mainWorldVersions: mainWorldResults.versions
        }
    }, (response) => {
        if (chrome.runtime.lastError) {
            chrome.runtime.sendMessage({
                type: 'SCAN_ERROR',
                payload: { error: chrome.runtime.lastError.message },
            });
            return;
        }
        if (response) {
            chrome.runtime.sendMessage({
                type: 'SCAN_COMPLETE',
                payload: response,
            });
        }
    });
}

async function handleInspect(tabId: number) {
    const ready = await ensureContentScriptLoaded(tabId);
    if (!ready) {
        chrome.runtime.sendMessage({
            type: 'INSPECT_ERROR',
            payload: { error: 'Content script not loaded. Please refresh the page.' },
        });
        return;
    }

    chrome.tabs.sendMessage(tabId, { type: 'ENTER_INSPECT_MODE' }, () => {
        if (chrome.runtime.lastError) {
            console.error('[Tracer] Error entering inspect mode:', chrome.runtime.lastError.message);
        }
    });
}

async function handleStopInspect(tabId: number) {
    chrome.tabs.sendMessage(tabId, { type: 'EXIT_INSPECT_MODE' }, () => {
        if (chrome.runtime.lastError) {
            console.error('[Tracer] Error exiting inspect mode:', chrome.runtime.lastError.message);
        }
    });
}

async function handleCapture(_tabId: number, rect: any): Promise<string> {
    try {
        const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
        return JSON.stringify({ screenshot: dataUrl, rect });
    } catch (e) {
        return JSON.stringify({ error: 'Capture failed' });
    }
}
