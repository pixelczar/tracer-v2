import { useState, useEffect } from 'react';
import 'geist/style.css';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { ColorSection } from './components/ColorSection';
import { TypographySection } from './components/TypographySection';
import { TechSection } from './components/TechSection';
import { InspectedElementCard } from './components/InspectedElement';
import { ThemePicker } from './components/ThemePicker';
import { Shimmer } from './components/Shimmer';
import { IconInspect } from './components/Icons';
import type { ScanResult, ScanState, InspectedElement, InspectState } from '../shared/types';

// Cursor bubble for side panel
function CursorBubble({ message, visible }: { message: string; visible: boolean }) {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Reduced spring stiffness for smoother movement
    const springConfig = { damping: 30, stiffness: 200 };
    const x = useSpring(cursorX, springConfig);
    const y = useSpring(cursorY, springConfig);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            cursorX.set(e.clientX + 16);
            cursorY.set(e.clientY + 16);
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, [cursorX, cursorY]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed top-0 left-0 pointer-events-none z-[9999] bg-fg text-bg px-3 py-1.5 text-2xs font-mono uppercase tracking-wider rounded"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [scanState, setScanState] = useState<ScanState>('idle');
    const [inspectState, setInspectState] = useState<InspectState>('idle');
    const [data, setData] = useState<ScanResult | null>(null);
    const [inspectedElement, setInspectedElement] = useState<InspectedElement | null>(null);
    const [currentDomain, setCurrentDomain] = useState<string>('');
    const [currentFavicon, setCurrentFavicon] = useState<string>('');
    const [cursorMessage, setCursorMessage] = useState('');
    const [cursorVisible, setCursorVisible] = useState(false);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    // Get current tab info immediately
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            if (tab?.url) {
                try {
                    const url = new URL(tab.url);
                    setCurrentDomain(url.hostname);
                } catch {
                    setCurrentDomain('');
                }
            }
            if (tab?.favIconUrl) {
                setCurrentFavicon(tab.favIconUrl);
            }
        });
    }, []);

    // Listen for messages from content script
    useEffect(() => {
        const handleMessage = (message: { type: string; payload?: unknown }) => {
            switch (message.type) {
                case 'SCAN_PROGRESS':
                    setCursorMessage((message.payload as { status: string }).status);
                    break;
                case 'SCAN_COMPLETE':
                    console.log('Scan complete', message.payload);
                    setData(message.payload as ScanResult);
                    setScanState('complete');
                    setCursorMessage('Complete');
                    setTimeout(() => setCursorVisible(false), 1000);
                    break;
                case 'SCAN_ERROR':
                    setScanState('error');
                    setCursorMessage('Error');
                    setTimeout(() => setCursorVisible(false), 1000);
                    console.error('[Tracer] Scan error:', (message.payload as { error: string })?.error);
                    break;
                case 'INSPECT_COMPLETE':
                    if (message.payload) {
                        setInspectedElement(message.payload as InspectedElement);
                        setInspectState('analyzing'); // Keep it active to show the card
                        setCursorMessage('Captured');
                        setTimeout(() => setCursorVisible(false), 1000);
                    }
                    break;
                case 'INSPECT_ERROR':
                    setInspectState('idle');
                    setCursorVisible(false);
                    console.error('[Tracer] Inspect error:', (message.payload as { error: string })?.error);
                    break;
                case 'CANCEL_INSPECT':
                    setInspectState('idle');
                    setCursorVisible(false);
                    break;
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    // Initial scan on mount
    useEffect(() => {
        startScan();
    }, []);

    const startScan = async () => {
        setScanState('scanning');
        setCursorVisible(true);
        setCursorMessage('Scanning');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.runtime.sendMessage({ type: 'START_SCAN', tabId: tab.id });
        }
    };

    const startInspect = async () => {
        setInspectState('selecting');
        setCursorVisible(true);
        setCursorMessage('Target acquisition');

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.runtime.sendMessage({ type: 'START_INSPECT', tabId: tab.id });
        }
    };

    const isLoading = scanState === 'scanning' || scanState === 'processing';
    const isInspecting = inspectState === 'selecting' || inspectState === 'analyzing';

    // Use data domain/favicon if available, otherwise use tab info
    const displayDomain = data?.domain || currentDomain || '';
    const displayFavicon = data?.favicon || currentFavicon || '';

    return (
        <>
            <CursorBubble message={cursorMessage} visible={cursorVisible} />

            <div className="min-h-screen bg-bg flex flex-col">
                {/* Responsive container */}
                <div className="w-full max-w-96 mx-auto flex flex-col min-h-screen">
                    {/* Header */}
                    <header className="flex items-center justify-between px-5 py-4 border-b border-faint">
                        <div className="flex items-center gap-2.5">
                            {displayFavicon && (
                                <img src={displayFavicon} alt="" className="w-5 h-5 rounded" />
                            )}
                            <span className="font-medium text-[15px] truncate">
                                {displayDomain}
                            </span>
                        </div>
                        <button
                            onClick={startInspect}
                            disabled={isInspecting}
                            className={`
                w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0
                transition-all duration-150
                ${isInspecting
                                    ? 'bg-accent text-black'
                                    : 'bg-subtle border border-faint text-muted hover:text-fg hover:border-muted'
                                }
              `}
                            title="Inspect element"
                        >
                            <IconInspect />
                        </button>
                    </header>

                    {/* Content */}
                    <main className="flex-1 px-5 py-6 flex flex-col gap-7 overflow-y-auto">
                        {/* Inspected Element */}
                        <AnimatePresence>
                            {(inspectedElement || inspectState === 'analyzing') && (
                                <InspectedElementCard
                                    element={inspectedElement}
                                    loading={inspectState === 'analyzing'}
                                    onClose={() => {
                                        setInspectedElement(null);
                                        setInspectState('idle');
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Colors */}
                        <section>
                            <h2 className="text-sm text-muted mb-3">
                                Colors
                            </h2>
                            {isLoading ? (
                                <div className="grid grid-cols-4 gap-0.5">
                                    {[...Array(8)].map((_, i) => (
                                        <Shimmer key={i} className="h-10" />
                                    ))}
                                </div>
                            ) : data?.colors && data.colors.length > 0 ? (
                                <ColorSection colors={data.colors} />
                            ) : (
                                <p className="text-xs text-muted">No colors found</p>
                            )}
                        </section>

                        {/* Typography */}
                        <section>
                            <h2 className="text-sm text-muted mb-3">
                                Typography
                            </h2>
                            {isLoading ? (
                                <div className="flex flex-col gap-5">
                                    <Shimmer className="h-[100px]" />
                                    <Shimmer className="h-[100px]" />
                                </div>
                            ) : data?.fonts && data.fonts.length > 0 ? (
                                <TypographySection fonts={data.fonts} />
                            ) : (
                                <p className="text-xs text-muted">No fonts found</p>
                            )}
                        </section>

                        {/* Tech */}
                        <section>
                            <h2 className="text-sm text-muted mb-3">
                                Tech
                            </h2>
                            {isLoading ? (
                                <div className="flex flex-col gap-1">
                                    {[...Array(6)].map((_, i) => (
                                        <Shimmer key={i} className="h-10" />
                                    ))}
                                </div>
                            ) : data?.tech && data.tech.length > 0 ? (
                                <TechSection tech={data.tech} />
                            ) : (
                                <p className="text-xs text-muted">No tech detected</p>
                            )}
                        </section>
                    </main>

                    {/* Footer */}
                    <footer className="px-5 py-4 border-t border-faint flex items-center justify-between">
                        <button
                            onClick={startScan}
                            disabled={isLoading}
                            className="text-xs font-medium text-muted hover:text-fg transition-colors disabled:opacity-30"
                        >
                            {isLoading ? 'Scanning...' : 'Rescan'}
                        </button>
                        <ThemePicker theme={theme} setTheme={setTheme} />
                    </footer>
                </div>
            </div>
        </>
    );
}
