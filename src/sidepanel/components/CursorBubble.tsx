import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
    message: string;
    visible: boolean;
}

export function CursorBubble({ message, visible }: Props) {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 400 };
    const x = useSpring(cursorX, springConfig);
    const y = useSpring(cursorY, springConfig);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            cursorX.set(e.clientX + 12);
            cursorY.set(e.clientY + 12);
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, [cursorX, cursorY]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed top-0 left-0 pointer-events-none z-[9999] bg-[#f0f0f0] text-[#0a0a0a] px-2.5 py-1 text-2xs font-mono rounded-full shadow-sm border border-black/5"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1, ease }}
                >
                    <ScrambleText text={message} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ScrambleText({ text, duration = 200 }: { text: string; duration?: number }) {
    const [display, setDisplay] = useState(text);
    const chars = '▲▼◀▶◆◇○●□■';

    useEffect(() => {
        let i = 0;
        const len = text.length * 2;
        const int = duration / len;
        const interval = setInterval(() => {
            setDisplay(text.split('').map((c, idx) =>
                idx < i / 2 ? text[idx] : c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
            ).join(''));
            if (++i >= len) { clearInterval(interval); setDisplay(text); }
        }, int);
        return () => clearInterval(interval);
    }, [text, duration]);

    return <span>{display}</span>;
}
