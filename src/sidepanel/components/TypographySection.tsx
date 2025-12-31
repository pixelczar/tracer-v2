import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import type { FontInfo } from '../../shared/types';

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

    useEffect(() => {
        const timer = setTimeout(() => {
            setPangramIndex(globalPangramIndex);
        }, index * 120);
        return () => clearTimeout(timer);
    }, [globalPangramIndex, index]);

    const currentPangram = PANGRAMS[pangramIndex];
    const canvasPreviews = font.preview.previews || [font.preview.data];
    const currentCanvasPreview = canvasPreviews[pangramIndex % canvasPreviews.length];

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.8, ease: sexyEase }}
            className="flex flex-col gap-3"
        >
            {/* Header */}
            <div className="flex items-baseline justify-between px-0.5">
                <span className="flex items-center gap-1 font-semibold text-[13px]">
                    {font.family}
                </span>
                <span className="text-[11px] font-mono text-muted">
                    {font.weights.join(' · ')}
                </span>
            </div>

            {/* Specimen */}
            <div className="py-4 border-b border-faint overflow-hidden min-h-[90px] relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pangramIndex}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 1, y: -4, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.9, ease: [0.85, 0, 0.15, 1] }}
                        className="w-full"
                    >
                        {font.preview.method === 'canvas' ? (
                            <img
                                src={currentCanvasPreview}
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
                                    className="text-[36px] leading-[1.05] tracking-tight whitespace-normal break-words max-w-[300px] line-clamp-2 overflow-hidden text-ellipsis"
                                    style={{
                                        fontFamily: font.preview.method === 'datauri'
                                            ? `'${font.family}-preview', sans-serif`
                                            : `'${font.family}', sans-serif`,
                                        fontWeight: font.weights[0]
                                    }}
                                >
                                    {currentPangram}
                                </p>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Details */}
            {font.letterSpacing.length > 0 && (
                <div className="text-[10px] text-muted font-mono tracking-wider uppercase hidden">
                    tracking: {font.letterSpacing.slice(0, 3).join(', ')}
                </div>
            )}
        </motion.div>
    );
}
