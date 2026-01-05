import { useState, useEffect, useRef } from 'react';
import '@fontsource/geist-sans';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { ColorSection } from './components/ColorSection';
import { TypographySection } from './components/TypographySection';
import { TechSection } from './components/TechSection';
import { InspectedElementCard } from './components/InspectedElement';
import { ThemePicker } from './components/ThemePicker';
import { IconInspect, IconRefresh } from './components/Icons';
import { DecryptedText } from './components/DecryptedText';
import { ScrambleText } from './components/ScrambleText';
import type { ScanResult, ScanState, InspectedElement, InspectState } from '../shared/types';
import { safeSendMessage, safeAddMessageListener, isExtensionContextValid } from '../shared/chromeUtils';
import logoLight from '../assets/tracer-text-on-light-slashes-00.svg';
import logoDark from '../assets/tracer-text-on-dark-slashes-00.svg';

// High-end easing for that premium feel
const sexyEase = [0.16, 1, 0.3, 1] as const;

function SectionWrapper({ children }: { children: (isHovered: boolean) => React.ReactNode }) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children(isHovered)}
        </div>
    );
}

function SectionHeader({ text, isSectionHovered }: { text: string; isSectionHovered: boolean }) {
    return (
        <h2 className="text-[12px] text-muted mb-4">
            <ScrambleText text={text} trigger={isSectionHovered} />
        </h2>
    );
}

// Cursor bubble for side panel
function CursorBubble({ message, visible }: { message: string; visible: boolean }) {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400 };
    const x = useSpring(cursorX, springConfig);
    const y = useSpring(cursorY, springConfig);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            cursorX.set(e.clientX + 10);
            cursorY.set(e.clientY + 10);
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, [cursorX, cursorY]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed top-0 left-0 pointer-events-none z-[9999] bg-[#0a0a0a] text-[#f0f0f0] px-3 py-1.5 text-2xs font-mono uppercase tracking-wider rounded-full shadow-lg border border-white/5"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function TracerLogo({ theme }: { theme: 'light' | 'dark' }) {
    return (
        <div className="p-4 opacity-10 select-none">
            <img
                src={theme === 'light' ? logoLight : logoDark}
                className="w-full h-auto"
                alt="Tracer"
            />
        </div>
    );
}

function LoadingState({ status, onFinished }: { status: string; onFinished?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: sexyEase } }}
            className="flex-1 flex flex-col h-full"
        >
            <div className="flex-1 flex flex-col items-start justify-start pt-2">
                <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: sexyEase }}
                >
                    <DecryptedText
                        text={status || "Initializing"}
                        className={`font-medium tracking-[0.1em] ${status?.includes('ERROR') ? 'text-red-500' : status === 'Error' ? 'text-red-500' : 'text-muted'}`}
                        onComplete={() => {
                            if (status === 'Complete') {
                                // Anticipation delay before reveal
                                setTimeout(() => {
                                    onFinished?.();
                                }, 500);
                            }
                        }}
                    />
                </motion.div>
            </div>
        </motion.div>
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
    const [isHovering, setIsHovering] = useState(false);
    const [revealData, setRevealData] = useState(false);
    const retryRef = useRef(false);
    const startScanRef = useRef<() => Promise<void>>();

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        if (!isExtensionContextValid()) {
            return;
        }

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
        }).catch((err) => {
            console.warn('[Tracer] Error querying tabs:', err);
        });
    }, []);

    useEffect(() => {
        const handleMessage = (message: { type: string; payload?: unknown }, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
            if (!isExtensionContextValid()) {
                return false;
            }

            switch (message.type) {
                case 'SCAN_PROGRESS': {
                    const status = (message.payload as { status: string }).status;
                    setCursorMessage(prev => {
                        if (prev === 'Complete' || prev === 'Error' || prev?.includes('ERROR')) return prev;
                        // Avoid repeats or backward status if somehow they arrive out of order
                        if (prev === status) return prev;
                        return status;
                    });
                    break;
                }
                case 'SCAN_COMPLETE':
                    setData(message.payload as ScanResult);
                    setScanState('complete');
                    setCursorMessage('Complete');
                    setTimeout(() => setCursorVisible(false), 2000);
                    break;
                case 'SCAN_ERROR':
                    setScanState('error');
                    setCursorMessage('ERROR, retrying');
                    setCursorVisible(true);
                    break;
                case 'INSPECT_COMPLETE':
                    if (message.payload) {
                        setInspectedElement(message.payload as InspectedElement);
                        setInspectState('complete');
                        setCursorMessage('Captured');
                        setTimeout(() => setCursorVisible(false), 1000);
                    }
                    break;
                case 'INSPECT_ERROR':
                    setInspectState('idle');
                    setCursorVisible(false);
                    break;
                case 'CANCEL_INSPECT':
                    setInspectState('idle');
                    setCursorVisible(false);
                    break;
            }
            return false;
        };

        const removeListener = safeAddMessageListener(handleMessage);
        return removeListener;
    }, []);

    useEffect(() => {
        startScan();
    }, []);

    const scanningRef = useRef(false);

    const startScan = async () => {
        if (scanningRef.current) return;
        if (!isExtensionContextValid()) {
            console.warn('[Tracer] Extension context invalidated, cannot start scan');
            setScanState('error');
            setCursorMessage('ERROR, retrying');
            setCursorVisible(true);
            return;
        }
        scanningRef.current = true;

        setData(null); // Clear data to trigger loading state
        setRevealData(false);
        setScanState('scanning');
        setCursorVisible(true);
        setCursorMessage('Scanning');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                safeSendMessage({ type: 'START_SCAN', tabId: tab.id });
            }
        } catch (err) {
            console.error('[Tracer] Error starting scan:', err);
            setScanState('error');
            setCursorMessage('ERROR, retrying');
            setCursorVisible(true);
        } finally {
            scanningRef.current = false;
        }
    };

    // Keep ref updated with latest startScan function
    useEffect(() => {
        startScanRef.current = startScan;
    }, [startScan]);

    // Safety check: If data is available but loading screen is stuck, force reveal
    useEffect(() => {
        if (data && !revealData && scanState === 'complete') {
            const timer = setTimeout(() => {
                setRevealData(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [data, revealData, scanState]);

    // Handle error: refresh tab and retry
    useEffect(() => {
        if (scanState === 'error' && !retryRef.current) {
            retryRef.current = true;
            
            const handleErrorRetry = async () => {
                if (!isExtensionContextValid()) {
                    retryRef.current = false;
                    return;
                }

                try {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tab?.id) {
                        // Update message to show we're refreshing
                        setCursorMessage('ERROR, REFRESHING PAGE...');
                        
                        // Refresh the tab
                        await chrome.tabs.reload(tab.id);
                        
                        // Wait for the page to load - listen for tab update
                        const onTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                chrome.tabs.onUpdated.removeListener(onTabUpdated);
                                
                                // Wait a bit more for scripts to initialize, then retry
                                setTimeout(() => {
                                    retryRef.current = false;
                                    setCursorMessage('Retrying scan...');
                                    startScanRef.current?.();
                                }, 1500);
                            }
                        };
                        
                        chrome.tabs.onUpdated.addListener(onTabUpdated);
                        
                        // Fallback timeout in case the page doesn't fire 'complete' status
                        setTimeout(() => {
                            chrome.tabs.onUpdated.removeListener(onTabUpdated);
                            if (retryRef.current) {
                                retryRef.current = false;
                                setCursorMessage('Retrying scan...');
                                startScanRef.current?.();
                            }
                        }, 10000);
                    } else {
                        retryRef.current = false;
                    }
                } catch (err) {
                    console.error('[Tracer] Error refreshing tab:', err);
                    retryRef.current = false;
                    setCursorMessage('ERROR, RETRYING');
                }
            };

            // Small delay before retrying to show the error message
            const timer = setTimeout(handleErrorRetry, 1000);
            return () => clearTimeout(timer);
        }
    }, [scanState]);

    const startInspect = async () => {
        if (!isExtensionContextValid()) {
            console.warn('[Tracer] Extension context invalidated, cannot start inspect');
            return;
        }

        setInspectState('selecting');
        setCursorVisible(true);
        setCursorMessage('Target acquisition');

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                safeSendMessage({ type: 'START_INSPECT', tabId: tab.id });
            }
        } catch (err) {
            console.error('[Tracer] Error starting inspect:', err);
            setInspectState('idle');
            setCursorVisible(false);
        }
    };

    const stopInspect = async () => {
        if (!isExtensionContextValid()) {
            console.warn('[Tracer] Extension context invalidated, cannot stop inspect');
            setInspectState('idle');
            setCursorVisible(false);
            return;
        }

        setInspectState('idle');
        setCursorVisible(false);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                safeSendMessage({ type: 'STOP_INSPECT', tabId: tab.id });
            }
        } catch (err) {
            console.error('[Tracer] Error stopping inspect:', err);
        }
    };

    const isLoading = scanState === 'scanning' || scanState === 'processing';
    const isInspecting = inspectState === 'selecting' || inspectState === 'analyzing';

    const rawDomain = data?.domain || currentDomain || '';
    const displayDomain = rawDomain.startsWith('www.') ? rawDomain.slice(4) : rawDomain;
    const displayFavicon = data?.favicon || currentFavicon || '';

    return (
        <>
            <CursorBubble message={cursorMessage} visible={cursorVisible && isHovering} />

            <div
                className="min-h-screen w-full bg-bg flex flex-col font-sans"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div className="w-full max-w-96 mx-auto flex flex-col min-h-screen">
                    <header className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-faint">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {displayFavicon && (
                                <motion.img
                                    key={`favicon-${displayFavicon}`}
                                    src={displayFavicon}
                                    alt=""
                                    className="w-5 h-5 rounded flex-shrink-0"
                                    initial={false}
                                    animate={{ opacity: isLoading ? 0 : 1 }}
                                    transition={{ duration: 0.4, ease: sexyEase }}
                                />
                            )}
                            {displayDomain && (
                                <motion.span
                                    key={`domain-${rawDomain}`}
                                    className="font-medium text-sm truncate"
                                    initial={false}
                                    animate={{ opacity: isLoading ? 0 : 1 }}
                                    transition={{ duration: 0.6, ease: sexyEase }}
                                >
                                    {displayDomain}
                                </motion.span>
                            )}
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                                onClick={startScan}
                                disabled={isLoading}
                                className={`
                                    w-8 h-8 rounded-md flex items-center justify-center
                                    transition-all duration-150
                                    border border-transparent text-fg opacity-60 hover:border-faint hover:opacity-100
                                    disabled:opacity-30 disabled:cursor-not-allowed
                                    active:scale-95
                                `}
                                title="Rescan"
                            >
                                <IconRefresh className={isLoading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={isInspecting ? stopInspect : startInspect}
                                className={`
                                    w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0
                                    transition-all duration-150
                                    ${isInspecting
                                        ? 'bg-accent text-black'
                                        : 'border border-transparent text-fg opacity-50 hover:border-faint hover:opacity-100'
                                    }
                                `}
                            >
                                <IconInspect />
                            </button>
                            <ThemePicker theme={theme} setTheme={setTheme} />
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-4 flex flex-col gap-10 overflow-y-scroll relative">
                        {/* Inspected Element - Renders independently of scan data */}
                        <AnimatePresence>
                            {(inspectedElement || inspectState === 'analyzing' || inspectState === 'complete') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.5, ease: sexyEase }}
                                >
                                    <InspectedElementCard
                                        element={inspectedElement}
                                        loading={inspectState === 'analyzing'}
                                        onClose={() => {
                                            setInspectedElement(null);
                                            setInspectState('idle');
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {!revealData ? (
                                <LoadingState
                                    key="loading"
                                    status={cursorMessage}
                                    onFinished={() => setRevealData(true)}
                                />
                            ) : data ? (
                                <motion.div
                                    key="content"
                                    initial="hidden"
                                    animate="show"
                                    variants={{
                                        show: {
                                            transition: {
                                                staggerChildren: 0.16,
                                                delayChildren: 0.6
                                            }
                                        }
                                    }}
                                    className="flex flex-col gap-6"
                                >

                                    {/* Colors */}
                                    {data.colors.length > 0 && (
                                        <SectionWrapper>
                                            {(isHovered) => (
                                                <motion.section
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 }
                                                    }}
                                                    transition={{ duration: 1.2, ease: sexyEase }}
                                                    className="group"
                                                >
                                                    <SectionHeader text="Colors" isSectionHovered={isHovered} />
                                                    <ColorSection colors={data.colors} />
                                                </motion.section>
                                            )}
                                        </SectionWrapper>
                                    )}

                                    {/* Typography */}
                                    {data.fonts.length > 0 && (
                                        <SectionWrapper>
                                            {(isHovered) => (
                                                <motion.section
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 }
                                                    }}
                                                    transition={{ duration: 1.2, ease: sexyEase }}
                                                    className="group"
                                                >
                                                    <SectionHeader text="Typography" isSectionHovered={isHovered} />
                                                    <TypographySection fonts={data.fonts} />
                                                </motion.section>
                                            )}
                                        </SectionWrapper>
                                    )}

                                    {/* Tech */}
                                    {data.tech.length > 0 && (
                                        <SectionWrapper>
                                            {(isHovered) => (
                                                <motion.section
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 }
                                                    }}
                                                    transition={{ duration: 1.2, ease: sexyEase }}
                                                    className=""
                                                >
                                                    <SectionHeader text="Tech" isSectionHovered={isHovered} />
                                                    <TechSection tech={data.tech} />
                                                </motion.section>
                                            )}
                                        </SectionWrapper>
                                    )}

                                    {/* OG Image */}
                                    {data.ogImage && (
                                        <SectionWrapper>
                                            {(isHovered) => (
                                                <motion.section
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 }
                                                    }}
                                                    transition={{ duration: 1.2, ease: sexyEase }}
                                                    className="group"
                                                >
                                                    <SectionHeader text="Metadata" isSectionHovered={isHovered} />
                                                    <motion.div
                                                        className="group relative aspect-[1.91/1] w-full overflow-hidden rounded-xl border border-faint bg-subtle box-border transition-colors cursor-zoom-in"
                                                        onClick={() => data.ogImage && window.open(data.ogImage, '_blank')}
                                                    >
                                                        <img
                                                            src={data.ogImage}
                                                            alt="Page Open Graph"
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </motion.div>
                                                </motion.section>
                                            )}
                                        </SectionWrapper>
                                    )}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </main>
                    
                    <footer className="flex-shrink-0 border-t border-faint">
                        <TracerLogo theme={theme} />
                    </footer>
                </div>
            </div>
        </>
    );
}
