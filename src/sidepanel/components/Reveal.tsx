import { motion } from 'motion/react';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
    children: ReactNode;
    delay?: number;
}

export function Reveal({ children, delay = 0 }: RevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.2,
                delay: delay * 0.03,
                ease,
            }}
        >
            {children}
        </motion.div>
    );
}
