import { motion } from 'motion/react';
import type { FontInfo } from '../../shared/types';
import { IconArrow } from './Icons';

const sexyEase = [0.16, 1, 0.3, 1] as const;

interface Props {
    fonts: FontInfo[];
}

export function IconFontsSection({ fonts }: Props) {
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
            className="flex flex-col gap-3"
        >
            {fonts.map((font) => (
                <IconFontItem
                    key={font.family}
                    font={font}
                />
            ))}
        </motion.div>
    );
}

function IconFontItem({ font }: { font: FontInfo }) {
    // Use icon samples extracted from content script
    const iconSamples = font.iconSamples || [];

    // Generate search URL
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${font.family} icon font`)}&udm=50`;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 6 },
                show: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.7, ease: sexyEase }}
            className="flex flex-col gap-2 group"
        >
            {/* Header */}
            <div className="flex items-baseline justify-between px-0.5">
                <span className="flex items-center gap-1.5 font-medium text-[13px]">
                    {font.family}
                    <a
                        href={searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-accent"
                        title={`Search for "${font.family} icon font" in Google AI`}
                    >
                        <IconArrow />
                    </a>
                </span>
            </div>

            {/* Icon Samples */}
            {iconSamples.length > 0 && (
                <div className="pt-2 pb-2 border-b border-faint">
                    <div 
                        className="flex flex-wrap gap-2 items-center"
                        style={{ fontFamily: `"${font.family}", sans-serif` }}
                    >
                        {iconSamples.map((icon, idx) => (
                            <span
                                key={idx}
                                className="text-2xl leading-none opacity-80 hover:opacity-100 transition-opacity"
                                title={`Icon: ${icon}`}
                            >
                                {icon}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Info */}
            {font.url && (
                <div className={`${iconSamples.length > 0 ? 'pt-1' : 'pt-2'} pb-3 border-b border-faint`}>
                    <a
                        href={font.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted hover:text-accent transition-colors truncate max-w-[280px]"
                    >
                        {font.url}
                    </a>
                </div>
            )}
        </motion.div>
    );
}
