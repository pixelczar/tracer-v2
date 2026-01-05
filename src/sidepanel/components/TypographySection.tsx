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
    const [globalPangramIndex, setGlobalPangramIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlobalPangramIndex((prev) => (prev + 1) % PANGRAMS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                show: {
                    transition: {
                        staggerChildren: 0.12,
                        delayChildren: 0.15
                    }
                }
            }}
            className="flex flex-col gap-5"
        >
            {fonts.map((font, i) => (
                <FontItem
                    key={font.family}
                    font={font}
                    index={i}
                    globalPangramIndex={globalPangramIndex}
                />
            ))}
        </motion.div>
    );
}

function FontItem({ font, index, globalPangramIndex }: { font: FontInfo; index: number; globalPangramIndex: number }) {
    const [pangramIndex, setPangramIndex] = useState(globalPangramIndex);
    const [activeWeight, setActiveWeight] = useState(font.weights[0]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPangramIndex(globalPangramIndex);
        }, index * 120);
        return () => clearTimeout(timer);
    }, [globalPangramIndex, index]);

    const currentPangram = PANGRAMS[pangramIndex];

    // Determine the source for the current specimen
    let specimenSrc = '';
    if (font.preview.method === 'canvas' && font.preview.weightPreviews) {
        specimenSrc = font.preview.weightPreviews[activeWeight]?.[pangramIndex % (font.preview.weightPreviews[activeWeight]?.length || 1)] || '';
    } else if (font.preview.method === 'canvas') {
        const previews = font.preview.previews || [font.preview.data];
        specimenSrc = previews[pangramIndex % previews.length];
    }

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 6 },
                show: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.7, ease: sexyEase }}
            className="flex flex-col gap-3 group"
        >
            {/* Header */}
            <div className="flex items-baseline justify-between px-0.5">
                <span className="flex items-center gap-1.5 font-semibold text-[13px]">
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
                    {font.weights.map((w, i) => (
                        <div key={w} className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveWeight(w)}
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
                            {i < font.weights.length - 1 && (
                                <span className="text-muted text-[9px] font-mono">/</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Specimen - Smoother easing, fade out down, fade in up */}
            <div className="py-4 border-b border-faint overflow-hidden min-h-[90px] relative">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`${pangramIndex}-${activeWeight}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className="w-full"
                    >
                        {font.preview.method === 'canvas' ? (
                            <img
                                src={specimenSrc}
                                alt={font.family}
                                className="max-w-[300px] h-auto dark:invert origin-left object-contain"
                            />
                        ) : (
                            <>
                                {font.preview.method === 'google' && (
                                    <link href={font.preview.data} rel="stylesheet" />
                                )}
                                {font.preview.method === 'datauri' && (
                                    <style>{`@font-face { font-family: '${font.family}-preview'; src: url('${font.preview.data}'); }`}</style>
                                )}
                                <p
                                    className="text-[36px] pb-2 leading-[1.05] tracking-tight whitespace-normal break-words max-w-[300px]"
                                    style={{
                                        fontFamily: font.preview.method === 'datauri'
                                            ? `'${font.family}-preview', sans-serif`
                                            : `'${font.family}', sans-serif`,
                                        fontWeight: activeWeight,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {currentPangram}
                                </p>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
