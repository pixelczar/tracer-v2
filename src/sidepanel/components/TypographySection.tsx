import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import type { FontInfo } from '../../shared/types';
import { IconArrow } from './Icons';

const sexyEase = [0.16, 1, 0.3, 1] as const;

const PANGRAMS = [
    "Sphinx of black quartz, judge my vow",
    "How quickly daft jumping zebras vex",
    "The five boxing wizards jump quickly",
    "Pack my box with five dozen liquor jugs",
    "Quick wafting zephyrs vex bold Jim"
];

interface Props {
    fonts: FontInfo[];
}

export function TypographySection({ fonts }: Props) {
    // Use a random pangram for the entire session
    const [sessionPangram] = useState(() => PANGRAMS[Math.floor(Math.random() * PANGRAMS.length)]);

    // Filter out icon fonts (safety check - should already be filtered in App.tsx)
    const regularFonts = fonts.filter(f => !f.isIconFont);
    
    // Create a key based on font families to trigger stagger re-animation when fonts change
    const fontsKey = regularFonts.map(f => f.family).join(',');

    return (
        <motion.div
            key={fontsKey}
            initial="hidden"
            animate="show"
            variants={{
                show: {
                    transition: {
                        staggerChildren: 0.12,
                        delayChildren: 0.05
                    }
                }
            }}
            className="flex flex-col gap-5"
        >
            {regularFonts.map((font) => (
                <FontItem
                    key={font.family}
                    font={font}
                    sessionPangram={font.preview.previewText || sessionPangram}
                />
            ))}
        </motion.div>
    );
}

function FontItem({ font, sessionPangram }: { font: FontInfo; sessionPangram: string }) {
    // Sort weights in numerical order
    const sortedWeights = [...font.weights].sort((a, b) => parseInt(a) - parseInt(b));
    const [activeWeight, setActiveWeight] = useState(sortedWeights[0]);
    const hasMultipleWeights = sortedWeights.length > 1;

    // Auto-cycle through weights if there are multiple
    useEffect(() => {
        if (!hasMultipleWeights) return;
        
        const interval = setInterval(() => {
            setActiveWeight((currentWeight) => {
                const currentIndex = sortedWeights.indexOf(currentWeight);
                const nextIndex = (currentIndex + 1) % sortedWeights.length;
                return sortedWeights[nextIndex];
            });
        }, 8000);
        return () => clearInterval(interval);
    }, [hasMultipleWeights, sortedWeights]);

    // Determine the source for the current specimen
    // Use the first pangram from weightPreviews (they should all use the same pangram now)
    let specimenSrc = '';
    if (font.preview.method === 'canvas' && font.preview.weightPreviews) {
        specimenSrc = font.preview.weightPreviews[activeWeight]?.[0] || '';
    } else if (font.preview.method === 'canvas') {
        const previews = font.preview.previews || [font.preview.data];
        specimenSrc = previews[0];
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 6 },
                show: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 1.0, ease: sexyEase }}
            className="flex flex-col gap-1 group"
        >
            {/* Header */}
            <div className="flex items-baseline justify-between px-0.5">
                <span className="flex items-center gap-1.5 font-medium text-[13px]">
                    {font.family}
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${font.family} font`)}&udm=50`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-accent"
                        title={`Search for "${font.family} font" in Google AI`}
                    >
                        <IconArrow />
                    </a>
                </span>
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {sortedWeights.map((w, i) => (
                        <div key={w} className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    setActiveWeight(w);
                                }}
                                className={`
                                    text-[10px] font-mono transition-all duration-200 px-0.5
                                    ${activeWeight === w
                                        ? 'text-fg font-bold'
                                        : 'text-muted hover:text-accent'
                                    }
                                `}
                            >
                                {w}
                            </button>
                            {i < sortedWeights.length - 1 && (
                                <span className="text-muted text-[9px] font-mono">/</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Specimen - Smoother easing, fade out down, fade in up */}
            <div className="py-2 border-b border-faint overflow-hidden min-h-[90px] relative">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={activeWeight}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{
                            duration: 0.4,
                            ease: sexyEase
                        }}
                        className="w-full"
                    >
                        {/* Canvas method - show captured image */}
                        {font.preview.method === 'canvas' && specimenSrc && (
                            <img
                                src={specimenSrc}
                                alt={font.family}
                                className="max-w-[300px] h-auto dark:invert origin-left object-contain"
                            />
                        )}
                        
                        {/* Canvas method failed - show placeholder, NOT wrong font */}
                        {font.preview.method === 'canvas' && !specimenSrc && (
                            <p className="text-[12px] text-muted mb-2 flex items-center">
                                Preview unavailable
                            </p>
                        )}
                        
                        {/* Google Fonts - load via link tag */}
                        {font.preview.method === 'google' && (
                            <>
                                <link href={font.preview.data} rel="stylesheet" />
                                <p
                                    className="text-2xl tracking-tight max-w-[300px]"
                                    style={{
                                        fontFamily: `'${font.family}', ${font.isMono ? 'monospace' : font.isSerif ? 'serif' : 'sans-serif'}`,
                                        fontWeight: activeWeight,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.2',
                                        WebkitFontSmoothing: 'antialiased',
                                        MozOsxFontSmoothing: 'grayscale',
                                        textRendering: 'optimizeLegibility'
                                    }}
                                >
                                    {sessionPangram}
                                </p>
                            </>
                        )}
                        
                        {/* Data URI - embed font via @font-face */}
                        {font.preview.method === 'datauri' && (
                            <>
                                <style>{`@font-face { font-family: '${font.family}-preview'; src: url('${font.preview.data}'); }`}</style>
                                <p
                                    className="text-2xl tracking-tight max-w-[300px]"
                                    style={{
                                        fontFamily: `'${font.family}-preview', ${font.isMono ? 'monospace' : font.isSerif ? 'serif' : 'sans-serif'}`,
                                        fontWeight: activeWeight,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'normal',
                                        lineHeight: '1.2',
                                        WebkitFontSmoothing: 'antialiased',
                                        MozOsxFontSmoothing: 'grayscale',
                                        textRendering: 'optimizeLegibility'
                                    }}
                                >
                                    {sessionPangram}
                                </p>
                            </>
                        )}
                        
                        {/* CSS method - render system fonts directly, or show placeholder for others */}
                        {font.preview.method === 'css' && (
                            <>
                                {/* If data is a font family name (system font fallback), render it directly */}
                                {font.preview.data && !font.preview.data.startsWith('http') && !font.preview.data.startsWith('data:') ? (
                                    <p
                                        className="text-2xl tracking-tight max-w-[300px]"
                                        style={{
                                            fontFamily: `'${font.preview.data}', ${font.isMono ? 'monospace' : font.isSerif ? 'serif' : 'sans-serif'}`,
                                            fontWeight: activeWeight,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'normal',
                                            lineHeight: '1.2',
                                            WebkitFontSmoothing: 'antialiased',
                                            MozOsxFontSmoothing: 'grayscale',
                                            textRendering: 'optimizeLegibility'
                                        }}
                                    >
                                        {sessionPangram}
                                    </p>
                                ) : (
                                    <p className="text-[12px] text-muted py-1 flex items-center">
                                        Preview unavailable
                                    </p>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
