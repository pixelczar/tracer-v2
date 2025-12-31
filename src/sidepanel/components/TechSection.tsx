import { motion } from 'motion/react';
import { TechItem } from './TechItem';
import type { TechInfo } from '../../shared/types';

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
    tech: TechInfo[];
}

export function TechSection({ tech }: Props) {
    // Sort: signals first, then by name
    const sorted = [...tech].sort((a, b) => {
        if (a.isSignal && !b.isSignal) return -1;
        if (!a.isSignal && b.isSignal) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="flex flex-col">
            {sorted.map((t, i) => (
                <motion.div
                    key={t.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.03, duration: 0.2, ease }}
                >
                    <TechItem tech={t} />
                </motion.div>
            ))}
        </div>
    );
}
