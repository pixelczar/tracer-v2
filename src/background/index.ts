// Enable side panel to open on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Track which tabs have the panel open and scope to specific tab
chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
        // Scope side panel to this specific tab
        await chrome.sidePanel.setOptions({
            tabId: tab.id,
            path: 'src/sidepanel/index.html',
            enabled: true,
        });
        await chrome.sidePanel.open({ tabId: tab.id });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_SCAN') {
        handleScan(message.tabId);
    }
    if (message.type === 'START_INSPECT') {
        handleInspect(message.tabId);
    }
    if (message.type === 'CAPTURE_ELEMENT') {
        handleCapture(message.tabId, message.rect).then(sendResponse);
        return true;
    }
    return true;
});

// Check if content script is loaded by sending a ping
async function ensureContentScriptLoaded(tabId: number): Promise<boolean> {
    return new Promise((resolve) => {
        // Try to ping the content script
        chrome.tabs.sendMessage(tabId, { type: 'PING' }, (response) => {
            if (chrome.runtime.lastError) {
                console.log('[Tracer] Content script not ready, will retry after reload');
                // The content script should auto-load via manifest.
                // If it's not responding, user may need to refresh the page
                resolve(false);
            } else if (response?.pong) {
                console.log('[Tracer] Content script ready');
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

async function handleScan(tabId: number) {
    const ready = await ensureContentScriptLoaded(tabId);

    if (!ready) {
        // Notify the panel that the page needs refresh
        chrome.runtime.sendMessage({
            type: 'SCAN_ERROR',
            payload: { error: 'Content script not loaded. Please refresh the page and try again.' },
        });
        return;
    }

    chrome.tabs.sendMessage(tabId, { type: 'EXTRACT' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('[Tracer] Error sending EXTRACT:', chrome.runtime.lastError.message);
            chrome.runtime.sendMessage({
                type: 'SCAN_ERROR',
                payload: { error: chrome.runtime.lastError.message },
            });
            return;
        }
        if (response) {
            // Forward to side panel
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

async function handleCapture(_tabId: number, rect: DOMRect): Promise<string> {
    const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
    return JSON.stringify({ screenshot: dataUrl, rect });
}
