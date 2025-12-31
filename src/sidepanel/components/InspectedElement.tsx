import { motion } from 'motion/react';
import { IconClose, IconArrow } from './Icons';
import { Shimmer } from './Shimmer';
import { TECH_CATEGORY_META, type InspectedElement } from '../../shared/types';

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
    element: InspectedElement | null;
    loading?: boolean;
    onClose: () => void;
}

export function InspectedElementCard({ element, loading, onClose }: Props) {
    return (
        <motion.div
            className="bg-subtle border border-faint rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease }}
        >
            {/* Header */}
            <div className="flex justify-between items-center px-3 py-2.5 border-b border-faint">
                <span className="text-xs font-mono tracking-widest text-accent">
                    TARGET ACQUIRED
                </span>
                <button
                    onClick={onClose}
                    className="p-1 text-fg hover:opacity-70 transition-all"
                >
                    <IconClose />
                </button>
            </div>

            {loading ? (
                <div className="p-3 flex flex-col gap-3">
                    <Shimmer className="h-[120px]" />
                    <div className="flex flex-col gap-2">
                        <Shimmer className="h-3.5 w-3/5" />
                        <Shimmer className="h-3.5 w-4/5" />
                    </div>
                </div>
            ) : element && (
                <>
                    {/* Screenshot */}
                    <div className="relative bg-[#1a1a2e] border-b border-faint">
                        <img
                            src={element.screenshot}
                            alt="Captured element"
                            className="w-full h-[120px] object-cover"
                        />
                        <div className="absolute bottom-2 right-2 text-2xs font-mono text-white/60 bg-black/50 px-1.5 py-0.5 rounded">
                            {element.rect.width} × {element.rect.height}
                        </div>
                    </div>

                    {/* Selector */}
                    <div className="px-3 py-2.5 font-mono text-2xs flex flex-wrap gap-1.5 border-b border-faint">
                        <span className="text-accent">{element.tagName}</span>
                        {element.attributes['data-engine'] && (
                            <span className="text-muted">
                                data-engine="{element.attributes['data-engine']}"
                            </span>
                        )}
                        {element.attributes['class'] && (
                            <span className="text-muted">
                                .{element.attributes['class'].split(' ')[0]}
                            </span>
                        )}
                    </div>

                    {/* Tech findings */}
                    {element.tech.length > 0 && (
                        <div className="px-3 py-2.5 flex flex-col gap-1.5">
                            {element.tech.map((t, i) => (
                                <motion.div
                                    key={t.name}
                                    className="flex items-center justify-between text-[13px] group"
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.04, duration: 0.2, ease }}
                                >
                                    <span className="flex items-center gap-1.5 font-medium">
                                        {t.isSignal && <span className="text-accent text-2xs">✦</span>}
                                        {t.name}
                                        {t.version && (
                                            <span className="text-muted text-2xs font-mono">{t.version}</span>
                                        )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xs font-mono text-muted uppercase">
                                            {TECH_CATEGORY_META[t.category]?.label || t.category}
                                        </span>
                                        <a
                                            href={t.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted opacity-40 group-hover:opacity-100 transition-opacity"
                                        >
                                            <IconArrow />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Styles */}
                    {(element.styles.animations.length > 0 ||
                        element.styles.transforms.length > 0 ||
                        element.styles.filters.length > 0) && (
                            <div className="px-3 py-2.5 border-t border-faint text-2xs font-mono text-muted flex flex-col gap-1">
                                {element.styles.animations.length > 0 && (
                                    <div>animation: {element.styles.animations[0]}</div>
                                )}
                                {element.styles.filters.length > 0 && (
                                    <div>filter: {element.styles.filters[0]}</div>
                                )}
                                {element.styles.blendModes.length > 0 && (
                                    <div>mix-blend-mode: {element.styles.blendModes[0]}</div>
                                )}
                            </div>
                        )}
                </>
            )}
        </motion.div>
    );
}
