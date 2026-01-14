import { useState, useEffect, useRef } from 'react';
import '@fontsource/geist-sans';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { ColorSection } from './components/ColorSection';
import { TypographySection } from './components/TypographySection';
import { IconFontsSection } from './components/IconFontsSection';
import { TechSection } from './components/TechSection';
import { InspectedElementCard } from './components/InspectedElement';
import { SettingsPopover } from './components/SettingsPopover';
import { OGMetadataSection } from './components/OGMetadataSection';
import { IconInspect, IconRefresh } from './components/Icons';
import { getSettings } from '../shared/settings';
import { ScrambleText } from './components/ScrambleText';
import type { ScanResult, ScanState, InspectedElement, InspectState } from '../shared/types';
import { safeSendMessage, safeSendMessageToTab, safeAddMessageListener, isExtensionContextValid } from '../shared/chromeUtils';
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

function SectionHeader({ text, isSectionHovered, count }: { text: string; isSectionHovered: boolean; count?: number }) {
    return (
        <h2 className="text-[12px] text-muted mb-2 flex items-center">
            <span className="inline-block min-w-[4ch]">
                <ScrambleText text={text} trigger={isSectionHovered} />
            </span>
            {count !== undefined && (
                <span className="ml-2 text-[10px] font-mono text-muted">
                    {count}
                </span>
            )}
        </h2>
    );
}

// Cursor bubble for side panel
function CursorBubble({ message, visible, instanceKey }: { message: string; visible: boolean; instanceKey?: string | number }) {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const [showUnderscore, setShowUnderscore] = useState(true);
    const bubbleRef = useRef<HTMLDivElement>(null);

    const springConfig = { damping: 25, stiffness: 400 };
    const x = useSpring(cursorX, springConfig);
    const y = useSpring(cursorY, springConfig);

    useEffect(() => {
        if (!visible) return;

        const updatePosition = (clientX: number, clientY: number) => {
            // Use requestAnimationFrame to ensure bubble is rendered
            requestAnimationFrame(() => {
                if (!bubbleRef.current) {
                    // Fallback if ref not ready
                    cursorX.set(clientX + 10);
                    cursorY.set(clientY + 10);
                    return;
                }
                
                const bubbleRect = bubbleRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                const offsetX = 10;
                const offsetY = 10;
                
                let adjustedX = clientX + offsetX;
                let adjustedY = clientY + offsetY;
                
                // Check right edge
                if (adjustedX + bubbleRect.width > viewportWidth) {
                    adjustedX = clientX - bubbleRect.width - offsetX;
                }
                
                // Check left edge
                if (adjustedX < 0) {
                    adjustedX = offsetX;
                }
                
                // Check bottom edge
                if (adjustedY + bubbleRect.height > viewportHeight) {
                    adjustedY = clientY - bubbleRect.height - offsetY;
                }
                
                // Check top edge
                if (adjustedY < 0) {
                    adjustedY = offsetY;
                }
                
                cursorX.set(adjustedX);
                cursorY.set(adjustedY);
            });
        };

        const move = (e: MouseEvent) => {
            updatePosition(e.clientX, e.clientY);
        };
        
        window.addEventListener('mousemove', move);
        
        // Also update on resize/scroll to handle edge cases
        const handleResize = () => {
            // Get current cursor position from motion values
            const currentX = cursorX.get();
            const currentY = cursorY.get();
            if (currentX > 0 && currentY > 0) {
                // Estimate cursor position (approximate)
                updatePosition(currentX - 10, currentY - 10);
            }
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize, true);
        
        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize, true);
        };
    }, [cursorX, cursorY, visible]);

    // Blink underscore for "//_" message
    useEffect(() => {
        if (message === '//_') {
            const interval = setInterval(() => {
                setShowUnderscore(prev => !prev);
            }, 530);
            return () => clearInterval(interval);
        } else {
            setShowUnderscore(true);
        }
    }, [message]);

    const displayMessage = message === '//_' 
        ? (
            <span style={{ letterSpacing: '-0.1em' }}>
                //<span style={{ opacity: showUnderscore ? 1 : 0, color: '#eaff00' }}>_</span>
            </span>
        )
        : message;

    return (
        <AnimatePresence mode="wait">
            {visible && (
                <motion.div
                    ref={bubbleRef}
                    key={instanceKey}
                    className="fixed top-0 left-0 pointer-events-none z-[9999] bg-[#0a0a0a] text-[#f0f0f0] px-3 py-1.5 text-2xs font-mono uppercase tracking-wider rounded-full shadow-lg border border-white/5"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                        duration: 0.6, 
                        ease: [0.16, 1, 0.3, 1],
                        opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                    }}
                >
                    {displayMessage}
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

export default function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [scanState, setScanState] = useState<ScanState>('idle');
    const [inspectState, setInspectState] = useState<InspectState>('idle');
    const [data, setData] = useState<ScanResult | null>(null);
    const [inspectedElement, setInspectedElement] = useState<InspectedElement | null>(null);
    const [currentDomain, setCurrentDomain] = useState<string>('');
    const [currentFavicon, setCurrentFavicon] = useState<string>('');
    const [cursorMessage, setCursorMessage] = useState('');
    const [headerStatus, setHeaderStatus] = useState('');
    const [cursorVisible, setCursorVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [revealData, setRevealData] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const retryRef = useRef(false);
    const startScanRef = useRef<() => Promise<void>>();

    // Load settings on mount
    useEffect(() => {
        const settings = getSettings();
        setTheme(settings.theme);
        document.documentElement.dataset.theme = settings.theme;
        
        // Immediately update icon when side panel loads
        if (isExtensionContextValid() && chrome.runtime) {
            chrome.runtime.sendMessage({ 
                type: 'UPDATE_ICON', 
                theme: settings.theme 
            }).catch(() => {
                // Ignore errors if background script isn't ready
            });
        }
    }, []);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        
        // Update favicon based on theme
        const faviconLink = document.getElementById('favicon') as HTMLLinkElement;
        if (faviconLink) {
            if (theme === 'light') {
                faviconLink.href = chrome.runtime.getURL('src/assets/icons/icon-light-128.png');
            } else {
                faviconLink.href = chrome.runtime.getURL('src/assets/icons/favicon_256.png');
            }
        }
        
        // Notify background script to update extension icon (which also updates side panel header)
        if (isExtensionContextValid() && chrome.runtime) {
            chrome.runtime.sendMessage({ 
                type: 'UPDATE_ICON', 
                theme 
            }).catch(() => {
                // Ignore errors if background script isn't ready
            });
        }
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
                    // Set cursor bubble to "//_" during scanning
                    setCursorMessage('//_');
                    // Set header status to actual progress message
                    setHeaderStatus(prev => {
                        if (prev === 'Complete' || prev === 'Error' || prev?.toLowerCase().includes('error')) return prev;
                        if (prev === status) return prev;
                        return status;
                    });
                    setCursorVisible(true);
                    break;
                }
                case 'SCAN_COMPLETE':
                    setData(message.payload as ScanResult);
                    setScanState('complete');
                    setHeaderStatus('Complete');
                    // Keep "//_" in cursor bubble, just hide it after delay
                    setTimeout(() => setCursorVisible(false), 2000);
                    break;
                case 'SCAN_ERROR':
                    setScanState('error');
                    setCursorMessage('//_');
                    setHeaderStatus('Error, retrying');
                    setCursorVisible(true);
                    break;
                case 'INSPECT_COMPLETE':
                    if (message.payload) {
                        setInspectedElement(message.payload as InspectedElement);
                        setInspectState('complete');
                        setCursorMessage('//_');
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

    // Sync cursor bubble with content script (DOM/site part)
    useEffect(() => {
        if (!isExtensionContextValid()) return;

        const syncCursor = async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tab?.id) return;

                if (cursorVisible && cursorMessage) {
                    await safeSendMessageToTab(tab.id, { 
                        type: 'UPDATE_CURSOR', 
                        message: cursorMessage
                    });
                } else {
                    await safeSendMessageToTab(tab.id, { 
                        type: 'HIDE_CURSOR'
                    });
                }
            } catch (err) {
                // Silently fail - content script might not be loaded yet
            }
        };

        syncCursor();
    }, [cursorMessage, cursorVisible]);

    useEffect(() => {
        startScan();
    }, []);

    const scanningRef = useRef(false);

        const startScan = async () => {
        if (scanningRef.current) return;
        if (!isExtensionContextValid()) {
            console.warn('[Tracer] Extension context invalidated, cannot start scan');
            setScanState('error');
            setCursorMessage('//_');
            setHeaderStatus('Error, retrying');
            setCursorVisible(true);
            return;
        }
        scanningRef.current = true;

        // Update scan state immediately for button loading state
        setScanState('scanning');
        
        // Smoothly fade out content first
        setRevealData(false);
        
        // Set cursor bubble to "//_" and show it
        setCursorMessage('//_');
        setCursorVisible(true);
        
        // Wait for exit animation to complete before clearing data and starting scan
        setTimeout(async () => {
            setData(null); // Clear data to trigger loading state

            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab?.id) {
                    safeSendMessage({ type: 'START_SCAN', tabId: tab.id });
                }
            } catch (err) {
                console.error('[Tracer] Error starting scan:', err);
                setScanState('error');
                setCursorMessage('//_');
                setHeaderStatus('Error, retrying');
                setCursorVisible(true);
            } finally {
                scanningRef.current = false;
            }
        }, 500);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                safeSendMessage({ type: 'START_SCAN', tabId: tab.id });
            }
        } catch (err) {
            console.error('[Tracer] Error starting scan:', err);
            setScanState('error');
            setCursorMessage('//_');
            setHeaderStatus('Error, retrying');
            setCursorVisible(true);
        } finally {
            scanningRef.current = false;
        }
    };

    // Keep ref updated with latest startScan function
    useEffect(() => {
        startScanRef.current = startScan;
    }, [startScan]);

    // Trigger reveal when status is Complete
    useEffect(() => {
        if (headerStatus === 'Complete' && data && !revealData) {
            // Wait for scramble animation to complete, then reveal
            const timer = setTimeout(() => {
                setRevealData(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [headerStatus, data, revealData]);

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
                        setCursorMessage('//_');
                        setHeaderStatus('Error, refreshing page...');
                        
                        // Refresh the tab
                        await chrome.tabs.reload(tab.id);
                        
                        // Wait for the page to load - listen for tab update
                        const onTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
                            if (tabId === tab.id && changeInfo.status === 'complete') {
                                chrome.tabs.onUpdated.removeListener(onTabUpdated);
                                
                                // Wait a bit more for scripts to initialize, then retry
                                setTimeout(() => {
                                    retryRef.current = false;
                                    setCursorMessage('//_');
                                    setCursorVisible(true);
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
                                setCursorMessage('//_');
                                setCursorVisible(true);
                                startScanRef.current?.();
                            }
                        }, 10000);
                    } else {
                        retryRef.current = false;
                    }
                } catch (err) {
                    console.error('[Tracer] Error refreshing tab:', err);
                    retryRef.current = false;
                    setCursorMessage('//_');
                    setHeaderStatus('Error, retrying');
                    setCursorVisible(true);
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
        setCursorMessage('//_');

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
    const showHeader = revealData;

    const rawDomain = data?.domain || currentDomain || '';
    const displayDomain = rawDomain.startsWith('www.') ? rawDomain.slice(4) : rawDomain;
    const displayFavicon = data?.favicon || currentFavicon || '';

    return (
        <>
            <CursorBubble message={cursorMessage} visible={cursorVisible && isHovering} instanceKey={`${scanState}-${cursorMessage}`} />

            <div
                className="min-h-screen w-full bg-bg flex flex-col font-sans scrollbar-gutter-stable"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div className="w-full max-w-96 mx-auto flex flex-col min-h-screen scrollbar-gutter-stable">
                    <header 
                        className="sticky top-0 z-10 flex items-center justify-between px-3 pt-3 pb-2 bg-bg"
                        style={{
                            boxShadow: `0 12px 32px -6px var(--bg), 0 6px 16px -3px var(--bg), 0 2px 8px -1px var(--bg)`
                        }}
                    >
                        <div className={`relative z-10 flex items-center gap-2.5 flex-1 min-w-0 transition-all duration-300 ${isSettingsOpen ? 'blur-lg' : ''}`}>
                            <AnimatePresence mode="wait">
                                {!revealData && headerStatus ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, ease: sexyEase }}
                                        className="flex items-center"
                                    >
                                        <h2 className={`text-[12px] ${headerStatus?.toLowerCase().includes('error') ? 'text-accent' : 'text-muted'}`}>
                                            <ScrambleText key={headerStatus} text={headerStatus} trigger={true} />
                                        </h2>
                                    </motion.div>
                                ) : revealData ? (
                                    <motion.div
                                        key="domain"
                                        className="flex items-center gap-2.5 flex-1 min-w-0"
                                        initial={{ opacity: 0, y: -3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -3 }}
                                        transition={{ duration: 0.6, ease: sexyEase }}
                                    >
                                        {displayFavicon && (
                                            <img
                                                src={displayFavicon}
                                                alt=""
                                                className="w-5 h-5 rounded flex-shrink-0"
                                            />
                                        )}
                                        {displayDomain && (
                                            <span className="font-medium text-sm truncate">
                                                {displayDomain}
                                            </span>
                                        )}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                        <motion.div 
                            className={`relative z-10 flex items-center gap-0.5 flex-shrink-0 transition-all duration-300 ${isSettingsOpen ? 'blur-lg' : ''}`}
                            initial="hidden"
                            animate={showHeader ? "visible" : "hidden"}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.08,
                                        delayChildren: 0.1
                                    }
                                }
                            }}
                        >
                            <motion.button
                                onClick={startScan}
                                disabled={isLoading}
                                className="
                                    w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0
                                    text-fg transition-all
                                    border border-transparent
                                    disabled:opacity-20
                                "
                                variants={{
                                    hidden: { opacity: 0, y: -3 },
                                    visible: { opacity: 0.4, y: 0 }
                                }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.5, ease: sexyEase }}
                            >
                                <IconRefresh />
                            </motion.button>
                            <motion.button
                                onClick={isInspecting ? stopInspect : startInspect}
                                className={`
                                    w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0
                                    transition-all border border-transparent
                                    ${isInspecting 
                                        ? 'bg-accent text-black' 
                                        : 'text-fg'
                                    }
                                `}
                                variants={{
                                    hidden: { opacity: 0, y: -3 },
                                    visible: { y: 0 }
                                }}
                                animate={showHeader 
                                    ? { 
                                        opacity: isInspecting ? 1 : 0.4,
                                        y: 0 
                                    } 
                                    : { opacity: 0, y: -3 }
                                }
                                whileHover={isInspecting ? {} : { opacity: 1 }}
                                transition={{ duration: 0.5, ease: sexyEase }}
                            >
                                <IconInspect />
                            </motion.button>
                        </motion.div>
                        <motion.div 
                            className="relative z-50" 
                            style={{ filter: 'none' }}
                            initial="hidden"
                            animate={showHeader || isSettingsOpen ? "visible" : "hidden"}
                            variants={{
                                hidden: { opacity: 0, y: -3 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            transition={{ duration: 0.5, ease: sexyEase }}
                        >
                            <SettingsPopover 
                                theme={theme} 
                                onThemeChange={(newTheme) => {
                                    setTheme(newTheme);
                                    document.documentElement.dataset.theme = newTheme;
                                }}
                                onRescan={startScan}
                                onOpenChange={setIsSettingsOpen}
                            />
                        </motion.div>
                    </header>

                    <main className={`flex-1 pl-4 pr-2 py-2 flex flex-col gap-10 overflow-y-auto relative scrollbar-gutter-stable transition-all duration-300 ${isSettingsOpen ? 'blur-lg' : ''}`}>
                        {/* Inspected Element - Renders independently of scan data */}
                        <AnimatePresence>
                            {(inspectedElement || inspectState === 'analyzing' || inspectState === 'complete') && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: .88, ease: sexyEase }}
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
                            {revealData && data ? (
                                <motion.div
                                    key="content"
                                    layout
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    variants={{
                                        hidden: { opacity: 0, y: 8 },
                                        show: {
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                staggerChildren: 0.28,
                                                delayChildren: 0.1
                                            }
                                        },
                                        exit: {
                                            opacity: 0,
                                            y: -8,
                                            transition: {
                                                duration: 0.5,
                                                ease: sexyEase,
                                                staggerChildren: 0.05,
                                                staggerDirection: -1
                                            }
                                        }
                                    }}
                                    className="flex flex-col gap-6"
                                >
                                    {(() => {
                                        // Filter fonts into regular and icon fonts
                                        const regularFonts = data.fonts.filter(f => !f.isIconFont);
                                        const iconFonts = data.fonts.filter(f => f.isIconFont);

                                        return (
                                            <>
                                    {/* Colors */}
                                    {data.colors.length > 0 && (
                                        <SectionWrapper>
                                            {(isHovered) => (
                                                <motion.section
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 }
                                                    }}
                                                    transition={{ duration: 1.0, ease: sexyEase }}
                                                    className="group"
                                                >
                                                    <SectionHeader text="Colors" isSectionHovered={isHovered} />
                                                    <ColorSection colors={data.colors} theme={theme} />
                                                </motion.section>
                                            )}
                                        </SectionWrapper>
                                    )}

                                    {/* Typography */}
                                    {regularFonts.length > 0 && (
                                        <SectionWrapper>
                                            {(isHovered) => (
                                                <motion.section
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 }
                                                    }}
                                                    transition={{ duration: 1.0, ease: sexyEase }}
                                                    className="group"
                                                >
                                                    <SectionHeader text="Typography" isSectionHovered={isHovered} />
                                                    <TypographySection fonts={regularFonts} />
                                                </motion.section>
                                            )}
                                        </SectionWrapper>
                                    )}

                                    {/* Icon Fonts */}
                                    {iconFonts.length > 0 && (
                                        <SectionWrapper>
                                            {(isHovered) => (
                                                <motion.section
                                                    variants={{
                                                        hidden: { opacity: 0, y: 6 },
                                                        show: { opacity: 1, y: 0 }
                                                    }}
                                                    transition={{ duration: 1.0, ease: sexyEase }}
                                                    className="group"
                                                >
                                                    <SectionHeader text="Icons" isSectionHovered={isHovered} />
                                                    <IconFontsSection fonts={iconFonts} />
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
                                                    transition={{ duration: 1.0, ease: sexyEase }}
                                                    className=""
                                                >
                                                    <SectionHeader text="Tech" isSectionHovered={isHovered} count={data.tech.length} />
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
                                                    transition={{ duration: 1.0, ease: sexyEase }}
                                                    className="group"
                                                >
                                                    <SectionHeader text="Meta" isSectionHovered={isHovered} />
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
                                                    {data.ogMetadata && (
                                                        <OGMetadataSection metadata={data.ogMetadata} />
                                                    )}
                                                </motion.section>
                                            )}
                                        </SectionWrapper>
                                    )}
                                            </>
                                        );
                                    })()}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </main>
                    
                    <footer className="flex-shrink-0">
                        <TracerLogo theme={theme} />
                    </footer>
                </div>
            </div>
        </>
    );
}
