import { motion } from 'motion/react';
import { IconSun, IconMoon } from './Icons';

interface Props {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export function ThemePicker({ theme, setTheme }: Props) {
    return (
        <motion.button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="
                w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0
                text-fg opacity-40 transition-all
                border border-transparent hover:opacity-100
            "
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            variants={{
                hidden: { opacity: 0, y: -3 },
                visible: { opacity: 0.4, y: 0 }
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
        </motion.button>
    );
}
