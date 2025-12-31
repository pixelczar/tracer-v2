import { useEffect, useState, useRef } from 'react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';

interface DecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    className?: string;
    onComplete?: () => void;
}

export function DecryptedText({
    text,
    speed = 40,
    maxIterations = 8,
    className = "",
    onComplete
}: DecryptedTextProps) {
    const [displayText, setDisplayText] = useState('');
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        let currentIteration = 0;

        // Safety check for empty or non-string input
        if (!text) return;

        if (intervalRef.current) window.clearInterval(intervalRef.current);

        intervalRef.current = window.setInterval(() => {
            setDisplayText(
                text
                    .split('')
                    .map((char, index) => {
                        if (char === ' ') return ' ';
                        // Reveal actual character after enough iterations
                        if (currentIteration > index * 2 + maxIterations) {
                            return text[index];
                        }
                        // Otherwise show random scramble character
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('')
            );

            currentIteration++;

            if (currentIteration >= text.length * 2 + maxIterations) {
                if (intervalRef.current) window.clearInterval(intervalRef.current);
                setDisplayText(text);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [text, speed, maxIterations, onComplete]);

    return (
        <span className={`font-mono text-sm uppercase flex items-center gap-0.5 ${className}`}>
            <span>{displayText}</span>
            <span className="w-[6px] h-[1.1em] bg-accent/80 animate-pulse" />
        </span>
    );
}
