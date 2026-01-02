/**
 * Utility functions for safely handling Chrome extension APIs
 * These functions gracefully handle "Extension context invalidated" errors
 * that occur when the extension is reloaded while content scripts are still active.
 */

/**
 * Checks if the Chrome extension context is still valid
 */
export function isExtensionContextValid(): boolean {
    try {
        // Try to access chrome.runtime.id - if context is invalid, this will throw
        return typeof chrome !== 'undefined' && 
               typeof chrome.runtime !== 'undefined' && 
               !!chrome.runtime.id;
    } catch (e) {
        return false;
    }
}

/**
 * Safely sends a message via chrome.runtime.sendMessage
 * Returns null if the context is invalid or an error occurs
 */
export function safeSendMessage(
    message: any,
    callback?: (response: any) => void
): void {
    if (!isExtensionContextValid()) {
        // Silently fail - extension was reloaded, this is expected
        callback?.(null);
        return;
    }

    try {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                const error = chrome.runtime.lastError.message || '';
                if (error.includes('Extension context invalidated') || 
                    error.includes('message port closed') ||
                    error.includes('Receiving end does not exist')) {
                    // Silently fail - extension was reloaded, this is expected
                    callback?.(null);
                    return;
                }
                // Only log unexpected errors
                console.error('[Tracer] Error sending message:', error);
                callback?.(null);
                return;
            }
            callback?.(response);
        });
    } catch (e: any) {
        // Check if it's an extension context error
        const errorMsg = e?.message || String(e);
        if (errorMsg.includes('Extension context invalidated') ||
            errorMsg.includes('message port closed')) {
            // Silently fail - extension was reloaded
            callback?.(null);
            return;
        }
        console.error('[Tracer] Exception sending message:', e);
        callback?.(null);
    }
}

/**
 * Safely sends a message via chrome.runtime.sendMessage with promise support
 * Returns a promise that resolves to the response or null if error
 */
export function safeSendMessagePromise(message: any): Promise<any> {
    return new Promise((resolve) => {
        safeSendMessage(message, resolve);
    });
}

/**
 * Safely sends a message to a specific tab
 * Returns a promise that resolves to the response or null if error
 */
export function safeSendMessageToTab(
    tabId: number,
    message: any
): Promise<any> {
    return new Promise((resolve) => {
        if (!isExtensionContextValid()) {
            // Silently fail - extension was reloaded
            resolve(null);
            return;
        }

        try {
            chrome.tabs.sendMessage(tabId, message, (response) => {
                if (chrome.runtime.lastError) {
                    const error = chrome.runtime.lastError.message || '';
                    if (error.includes('Extension context invalidated') || 
                        error.includes('message port closed') ||
                        error.includes('Receiving end does not exist')) {
                        // Silently fail - extension was reloaded or tab closed
                        resolve(null);
                        return;
                    }
                    // Only log unexpected errors
                    console.error('[Tracer] Error sending message to tab:', error);
                    resolve(null);
                    return;
                }
                resolve(response);
            });
        } catch (e: any) {
            // Check if it's an extension context error
            const errorMsg = e?.message || String(e);
            if (errorMsg.includes('Extension context invalidated') ||
                errorMsg.includes('message port closed')) {
                // Silently fail - extension was reloaded
                resolve(null);
                return;
            }
            console.error('[Tracer] Exception sending message to tab:', e);
            resolve(null);
        }
    });
}

/**
 * Safely adds a message listener with error handling
 * Returns a cleanup function to remove the listener
 */
export function safeAddMessageListener(
    callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void | boolean
): () => void {
    const wrappedCallback = (
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) => {
        try {
            if (!isExtensionContextValid()) {
                // Silently ignore - extension was reloaded
                return false;
            }
            return callback(message, sender, sendResponse);
        } catch (e: any) {
            // Check if it's an extension context error
            const errorMsg = e?.message || String(e);
            if (errorMsg.includes('Extension context invalidated') ||
                errorMsg.includes('message port closed')) {
                // Silently ignore - extension was reloaded
                return false;
            }
            console.error('[Tracer] Error in message listener:', e);
            return false;
        }
    };

    try {
        chrome.runtime.onMessage.addListener(wrappedCallback);
    } catch (e) {
        // If we can't add listener, extension context is invalid
        // Return a no-op cleanup function
        return () => {};
    }
    
    return () => {
        try {
            chrome.runtime.onMessage.removeListener(wrappedCallback);
        } catch (e) {
            // Ignore errors during cleanup
        }
    };
}

