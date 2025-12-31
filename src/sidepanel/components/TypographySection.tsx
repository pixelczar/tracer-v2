import { motion } from 'motion/react';
import { IconArrow } from './Icons';
import type { FontInfo } from '../../shared/types';

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
    fonts: FontInfo[];
}

export function TypographySection({ fonts }: Props) {
    return (
        <div className="flex flex-col gap-6">
            {fonts.map((font, i) => (
                <motion.div
                    key={font.family}
                    className="flex flex-col gap-2"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.2, ease }}
                >
                    {/* Header */}
                    <div className="flex items-baseline justify-between">
                        <a
                            href={font.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-medium text-[13px] hover:text-muted transition-colors"
                        >
                            {font.family}
                        </a>
                        <span className="text-xs font-mono text-muted">
                            {font.weights.join(' · ')}
                        </span>
                    </div>

                    {/* Specimen */}
                    <div className="py-4 border-t border-b border-faint">
                        {font.preview.method === 'canvas' ? (
                            <img
                                src={font.preview.data}
                                alt={font.family}
                                className="max-w-full h-auto"
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
                                    className="text-xl tracking-tight"
                                    style={{
                                        fontFamily: font.preview.method === 'datauri'
                                            ? `'${font.family}-preview'`
                                            : `'${font.family}'`
                                    }}
                                >
                                    Sphinx of black quartz, judge my vow
                                </p>
                            </>
                        )}
                    </div>

                    {/* Details */}
                    {font.letterSpacing.length > 0 && (
                        <div className="text-2xs text-muted font-mono">
                            tracking: {font.letterSpacing.slice(0, 3).join(', ')}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
