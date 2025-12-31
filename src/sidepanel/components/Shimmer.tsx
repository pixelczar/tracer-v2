import { motion } from 'motion/react';

interface Props {
    className?: string;
}

export function Shimmer({ className }: Props) {
    return (
        <motion.div
            className={`shimmer ${className || ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
        />
    );
}
