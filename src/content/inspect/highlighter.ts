let inspectMode = false;
let overlay: HTMLElement | null = null;
let infoTooltip: HTMLElement | null = null;
let currentElement: Element | null = null;
let onSelectCallback: ((el: Element) => void) | null = null;

export function enterInspectMode(onSelect: (el: Element) => void) {
    inspectMode = true;
    onSelectCallback = onSelect;

    // Detect page brightness for highlight color
    const isDark = isPageDark();

    // Create overlay
    overlay = document.createElement('div');
    overlay.id = 'tracer-overlay';
    overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999998;
    border: 1.5px solid ${isDark ? '#eaff00' : '#2684ff'};
    background: ${isDark ? 'rgba(234, 255, 0, 0.08)' : 'rgba(38, 132, 255, 0.08)'};
    transition: all 0.08s ease-out;
    opacity: 0;
  `;
    document.body.appendChild(overlay);

    // Create corner markers
    const corners = ['tl', 'tr', 'bl', 'br'];
    corners.forEach(pos => {
        const corner = document.createElement('div');
        corner.className = `tracer-corner tracer-corner-${pos}`;
        corner.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1.5px solid ${isDark ? '#eaff00' : '#2684ff'};
      ${pos.includes('t') ? 'top: -4px;' : 'bottom: -4px;'}
      ${pos.includes('l') ? 'left: -4px;' : 'right: -4px;'}
      ${pos.includes('t') && pos.includes('l') ? 'border-right: none; border-bottom: none;' : ''}
      ${pos.includes('t') && pos.includes('r') ? 'border-left: none; border-bottom: none;' : ''}
      ${pos.includes('b') && pos.includes('l') ? 'border-right: none; border-top: none;' : ''}
      ${pos.includes('b') && pos.includes('r') ? 'border-left: none; border-top: none;' : ''}
    `;
        overlay!.appendChild(corner);
    });

    // Create info tooltip
    infoTooltip = document.createElement('div');
    infoTooltip.id = 'tracer-tooltip';
    infoTooltip.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999999;
    background: ${isDark ? '#f0f0f0' : '#0a0a0a'};
    color: ${isDark ? '#0a0a0a' : '#f0f0f0'};
    padding: 6px 10px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    display: flex;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.1s ease;
  `;
    document.body.appendChild(infoTooltip);

    // Set cursor
    document.body.style.cursor = 'crosshair';

    // Add listeners
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    // Send status
    chrome.runtime.sendMessage({ type: 'INSPECT_HOVER', payload: { status: 'Target acquisition' } });
}

export function exitInspectMode() {
    inspectMode = false;

    if (overlay) {
        overlay.remove();
        overlay = null;
    }
    if (infoTooltip) {
        infoTooltip.remove();
        infoTooltip = null;
    }

    document.body.style.cursor = '';

    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);

    currentElement = null;
    onSelectCallback = null;
}

function handleMouseMove(e: MouseEvent) {
    if (!inspectMode || !overlay || !infoTooltip) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === overlay || el === infoTooltip) return;
    if (el === currentElement) return;

    currentElement = el;

    const rect = el.getBoundingClientRect();

    // Update overlay position
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.opacity = '1';

    // Update tooltip
    const tagName = el.tagName.toLowerCase();
    const dimensions = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;

    infoTooltip.innerHTML = `
    <span style="color: #eaff00;">${tagName}</span>
    <span style="opacity: 0.6;">${dimensions}</span>
  `;

    // Position tooltip above element
    const tooltipY = rect.top - 32;
    infoTooltip.style.top = `${tooltipY > 0 ? tooltipY : rect.bottom + 8}px`;
    infoTooltip.style.left = `${rect.left}px`;
    infoTooltip.style.opacity = '1';

    // Update status
    chrome.runtime.sendMessage({ type: 'INSPECT_HOVER', payload: { status: 'Locked on' } });
}

function handleClick(e: MouseEvent) {
    if (!inspectMode) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const el = currentElement;
    if (!el) return;

    // Flash effect
    if (overlay) {
        overlay.style.background = isPageDark()
            ? 'rgba(234, 255, 0, 0.25)'
            : 'rgba(38, 132, 255, 0.25)';
    }

    // Exit and callback
    setTimeout(() => {
        exitInspectMode();
        if (onSelectCallback && el) {
            onSelectCallback(el);
        }
    }, 100);
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        exitInspectMode();
        chrome.runtime.sendMessage({ type: 'CANCEL_INSPECT' });
    }
}

function isPageDark(): boolean {
    const bg = getComputedStyle(document.body).backgroundColor;
    const match = bg.match(/\d+/g);
    if (!match) return false;
    const [r, g, b] = match.map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}
