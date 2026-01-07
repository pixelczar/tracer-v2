import { motion } from 'motion/react';
import type { ScanResult } from '../../shared/types';

const sexyEase = [0.16, 1, 0.3, 1] as const;

interface Props {
    metadata: NonNullable<ScanResult['ogMetadata']>;
}

export function OGMetadataSection({ metadata }: Props) {
    const entries = [
        { label: 'Title', value: metadata.title },
        { label: 'Description', value: metadata.description },
        // { label: 'Type', value: metadata.type },
        { label: 'URL', value: metadata.url },
        { label: 'Site Name', value: metadata.siteName },
    ].filter(entry => entry.value);

    if (entries.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: sexyEase }}
            className="space-y-4 pt-4 mb-4"
        >
            {entries.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                    {/* <span className="text-2xs font-mono text-muted uppercase">{label}</span> */}
                    <span className={`break-words text-[13px] font-medium ${label === 'Title' ? 'text-fg' : 'text-muted'}`}>{value}</span>
                </div>
            ))}
        </motion.div>
    );
}

