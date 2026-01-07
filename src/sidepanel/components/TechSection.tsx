import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { TechItem } from './TechItem';
import { TECH_CATEGORY_META, type TechInfo } from '../../shared/types';
import { getSettings } from '../../shared/settings';

const sexyEase = [0.16, 1, 0.3, 1] as const;

interface Props {
    tech: TechInfo[];
}

export function TechSection({ tech }: Props) {
    // Track settings changes to trigger re-render
    const [, forceUpdate] = useState(0);
    
    useEffect(() => {
        const handleSettingsChange = () => {
            forceUpdate(n => n + 1);
        };
        window.addEventListener('tracer:settings-changed', handleSettingsChange);
        return () => window.removeEventListener('tracer:settings-changed', handleSettingsChange);
    }, []);

    // Filter by hidden categories
    const settings = getSettings();
    const filteredTech = tech.filter(t => !settings.hiddenCategories.includes(t.category));

    // Group by category group
    const groups = filteredTech.reduce((acc, t) => {
        const meta = TECH_CATEGORY_META[t.category];
        const groupName = meta?.group || 'Other';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(t);
        return acc;
    }, {} as Record<string, TechInfo[]>);

    const groupOrder = ['Frontend', 'Styling', 'Graphics', 'Content', 'Analytics', 'Marketing', 'Commerce', 'Infra', 'Security', 'Developer', 'Misc'];
    const sortedGroupNames = Object.keys(groups).sort((a, b) => {
        const idxA = groupOrder.indexOf(a);
        const idxB = groupOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    const allSortedTech = sortedGroupNames.flatMap(name =>
        groups[name].sort((a, b) => {
            if (a.isSignal && !b.isSignal) return -1;
            if (!a.isSignal && b.isSignal) return 1;
            return a.name.localeCompare(b.name);
        })
    );

    return (
        <div className="tech-container">
            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    show: {
                        transition: {
                            staggerChildren: 0.08,
                            delayChildren: 0.4
                        }
                    }
                }}
                className="tech-grid overflow-hidden"
            >
                {allSortedTech.map((t) => (
                    <motion.div
                        key={t.name}
                        variants={{
                            hidden: { opacity: 0, y: 6 },
                            show: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.6, ease: sexyEase }}
                    >
                        <TechItem tech={t} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
