import { useEffect, useState } from 'react';

interface ScrambleTextProps {
    text: string;
    duration?: number;
    trigger?: boolean;
}

export function ScrambleText({ text, duration = 200, trigger = true }: ScrambleTextProps) {
    const [display, setDisplay] = useState(text);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';

    useEffect(() => {
        if (!trigger) {
            setDisplay(text);
            return;
        }

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
    }, [text, duration, trigger]);

    return <span>{display}</span>;
}

