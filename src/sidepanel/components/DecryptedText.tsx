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
    const lastAnimatedText = useRef('');
    const intervalRef = useRef<number | null>(null);

    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!text || text === lastAnimatedText.current) return;
        lastAnimatedText.current = text;

        let currentIteration = 0;
        if (intervalRef.current) window.clearInterval(intervalRef.current);

        // Set initial random state immediately to avoid blank frames
        setDisplayText(
            text
                .split('')
                .map((char) => {
                    if (char === ' ') return ' ';
                    return characters[Math.floor(Math.random() * characters.length)];
                })
                .join('')
        );

        intervalRef.current = window.setInterval(() => {
            setDisplayText(
                text
                    .split('')
                    .map((char, index) => {
                        if (char === ' ') return ' ';
                        if (currentIteration > index * 2 + maxIterations) {
                            return text[index];
                        }
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('')
            );

            currentIteration++;

            if (currentIteration >= text.length * 2 + maxIterations) {
                if (intervalRef.current) window.clearInterval(intervalRef.current);
                setDisplayText(text);
                if (onCompleteRef.current) onCompleteRef.current();
            }
        }, speed);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [text, speed, maxIterations]);

    return (
        <span className={`font-mono font-normal text-sm uppercase flex items-center gap-0.5 ${className}`}>
            <span>{displayText}</span>
            <span className="w-[6px] h-[1.1em] bg-accent/80 animate-blink" />
        </span>
    );
}
