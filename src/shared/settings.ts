import type { TechCategory, ColorFormat } from './types';

export interface Settings {
    theme: 'light' | 'dark';
    deepScan: boolean;
    hiddenCategories: TechCategory[]; // Array of category keys to hide (empty = show all)
    hiddenColorFormats: ColorFormat[]; // Array of color format keys to hide (empty = show all)
    fontPreviewSource: 'pangram' | 'og-description' | 'page-content';
    categoryGroupOrder?: string[]; // Custom order for category groups (empty = use default)
}

const SETTINGS_KEY = 'tracer_settings';
const DEFAULT_SETTINGS: Settings = {
    theme: 'dark',
    deepScan: false,
    hiddenCategories: [],
    hiddenColorFormats: [],
    fontPreviewSource: 'pangram',
};

export async function getSettingsAsync(): Promise<Settings> {
    // Try localStorage first (for extension pages like sidepanel)
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to handle missing fields
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch (e) {
        // localStorage not available, try chrome.storage
    }

    // For content scripts, use chrome.storage (async)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
            const result = await chrome.storage.local.get(SETTINGS_KEY);
            if (result[SETTINGS_KEY]) {
                return { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
            }
        } catch (e) {
            console.warn('[Tracer] Failed to load settings from chrome.storage:', e);
        }
    }

    return { ...DEFAULT_SETTINGS };
}

export function getSettings(): Settings {
    // Try localStorage first (for extension pages like sidepanel)
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to handle missing fields
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch (e) {
        console.warn('[Tracer] Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Settings): void {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        // Also sync to chrome.storage for background script access
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [SETTINGS_KEY]: settings }).catch(() => {});
        }
    } catch (e) {
        console.error('[Tracer] Failed to save settings:', e);
    }
}

export function updateSettings(updates: Partial<Settings>): Settings {
    const current = getSettings();
    const updated = { ...current, ...updates };
    saveSettings(updated);
    return updated;
}

