import { useState, useEffect } from 'react';
import '@fontsource/geist-sans';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { ColorSection } from './components/ColorSection';
import { TypographySection } from './components/TypographySection';
import { TechSection } from './components/TechSection';
import { InspectedElementCard } from './components/InspectedElement';
import { ThemePicker } from './components/ThemePicker';
import { IconInspect } from './components/Icons';
import { DecryptedText } from './components/DecryptedText';
import type { ScanResult, ScanState, InspectedElement, InspectState } from '../shared/types';
import logoLight from '../assets/tracer-text-on-light-slashes-00.svg';
import logoDark from '../assets/tracer-text-on-dark-slashes-00.svg';

// High-end easing for that premium feel
const sexyEase = [0.16, 1, 0.3, 1] as const;

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
        <div className="mt-auto pt-10 pb-4 opacity-10 select-none">
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
            exit={{ opacity: 0, transition: { duration: 0.4, ease: sexyEase } }}
            className="flex-1 flex flex-col items-start justify-start pt-2"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{ duration: 0.3, ease: sexyEase }}
                >
                    <DecryptedText
                        text={status || "Initializing"}
                        className="text-muted/80 font-medium tracking-[0.1em]"
                        onComplete={() => {
                            if (status === 'Complete' || status === 'Error') {
                                onFinished?.();
                            }
                        }}
                    />
                </motion.div>
            </AnimatePresence>
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

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

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

    useEffect(() => {
        const handleMessage = (message: { type: string; payload?: unknown }) => {
            switch (message.type) {
                case 'SCAN_PROGRESS':
                    setCursorMessage((message.payload as { status: string }).status);
                    break;
                case 'SCAN_COMPLETE':
                    setData(message.payload as ScanResult);
                    setScanState('complete');
                    setCursorMessage('Complete');
                    setTimeout(() => setCursorVisible(false), 1000);
                    break;
                case 'SCAN_ERROR':
                    setScanState('error');
                    setCursorMessage('Error');
                    setTimeout(() => setCursorVisible(false), 1000);
                    break;
                case 'INSPECT_COMPLETE':
                    if (message.payload) {
                        setInspectedElement(message.payload as InspectedElement);
                        setInspectState('analyzing');
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
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    useEffect(() => {
        startScan();
    }, []);

    const startScan = async () => {
        setData(null); // Clear data to trigger loading state
        setRevealData(false);
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

    const stopInspect = async () => {
        setInspectState('idle');
        setCursorVisible(false);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.runtime.sendMessage({ type: 'STOP_INSPECT', tabId: tab.id });
        }
    };

    const isLoading = scanState === 'scanning' || scanState === 'processing';
    const isInspecting = inspectState === 'selecting' || inspectState === 'analyzing';

    const displayDomain = data?.domain || currentDomain || '';
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
                            onClick={isInspecting ? stopInspect : startInspect}
                            className={`
                                w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0
                                transition-all duration-150
                                ${isInspecting
                                    ? 'bg-accent text-black'
                                    : 'border border-faint text-fg hover:border-muted'
                                }
                            `}
                        >
                            <IconInspect />
                        </button>
                    </header>

                    <main className="flex-1 px-5 py-6 flex flex-col gap-10 overflow-y-auto relative">
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
                                                staggerChildren: 0.15,
                                                delayChildren: 0.2
                                            }
                                        }
                                    }}
                                    className="flex flex-col gap-10"
                                >
                                    {/* Inspected Element */}
                                    <AnimatePresence>
                                        {(inspectedElement || inspectState === 'analyzing') && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.6, ease: sexyEase }}
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

                                    {/* Colors */}
                                    {data.colors.length > 0 && (
                                        <motion.section
                                            variants={{
                                                hidden: { opacity: 0, y: 24 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ duration: 0.8, ease: sexyEase }}
                                        >
                                            <h2 className="text-[12px] text-muted mb-4">
                                                Colors
                                            </h2>
                                            <ColorSection colors={data.colors} />
                                        </motion.section>
                                    )}

                                    {/* Typography */}
                                    {data.fonts.length > 0 && (
                                        <motion.section
                                            variants={{
                                                hidden: { opacity: 0, y: 24 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ duration: 0.8, ease: sexyEase }}
                                        >
                                            <h2 className="text-[12px] text-muted mb-4">
                                                Typography
                                            </h2>
                                            <TypographySection fonts={data.fonts} />
                                        </motion.section>
                                    )}

                                    {/* Tech */}
                                    {data.tech.length > 0 && (
                                        <motion.section
                                            variants={{
                                                hidden: { opacity: 0, y: 24 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ duration: 0.8, ease: sexyEase }}
                                        >
                                            <h2 className="text-[12px] text-muted mb-4">
                                                Tech Stack
                                            </h2>
                                            <TechSection tech={data.tech} />
                                        </motion.section>
                                    )}

                                    {/* OG Image */}
                                    {data.ogImage && (
                                        <motion.section
                                            variants={{
                                                hidden: { opacity: 0, y: 24 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            transition={{ duration: 0.8, ease: sexyEase }}
                                        >
                                            <h2 className="text-[12px] text-muted mb-4">
                                                Metadata
                                            </h2>
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

                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: { opacity: 1 }
                                        }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                    >
                                        <TracerLogo theme={theme} />
                                    </motion.div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </main>

                    <footer className="px-5 py-4 flex items-center justify-between border-t border-faint">
                        <button
                            onClick={startScan}
                            disabled={isLoading}
                            className="
                                px-4 py-2 rounded-md text-xs font-medium 
                                border border-faint text-fg hover:border-muted transition-all 
                                disabled:opacity-30 active:scale-95
                            "
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
