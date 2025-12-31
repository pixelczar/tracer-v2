import type { ScanResult, InspectedElement } from './types';

const MAX_SCANS = 50;

export async function saveScan(scan: ScanResult): Promise<void> {
    const { scans = [] } = await chrome.storage.local.get('scans');
    const updated = [scan, ...scans.filter((s: ScanResult) => s.id !== scan.id)].slice(0, MAX_SCANS);
    await chrome.storage.local.set({ scans: updated, lastScan: scan });
}

export async function getRecentScans(): Promise<ScanResult[]> {
    const { scans = [] } = await chrome.storage.local.get('scans');
    return scans;
}

export async function getLastScan(): Promise<ScanResult | null> {
    const { lastScan } = await chrome.storage.local.get('lastScan');
    return lastScan || null;
}

export async function addInspectedElement(scanId: string, element: InspectedElement): Promise<void> {
    const { scans = [] } = await chrome.storage.local.get('scans');
    const scan = scans.find((s: ScanResult) => s.id === scanId);
    if (scan) {
        scan.inspectedElements = [element, ...(scan.inspectedElements || [])].slice(0, 10);
        await chrome.storage.local.set({ scans });
    }
}
