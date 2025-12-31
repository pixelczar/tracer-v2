import { motion } from 'motion/react';
import type { ColorInfo } from '../../shared/types';

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
    colors: ColorInfo[];
}

export function ColorSection({ colors }: Props) {
    const sorted = [...colors].sort((a, b) => b.weight - a.weight);

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
    };

    return (
        <div className="grid grid-cols-4 gap-1" style={{ gridAutoRows: '40px' }}>
            {sorted.map((color, i) => (
                <motion.button
                    key={color.hex}
                    onClick={() => handleCopy(color.hex)}
                    className={`
            relative cursor-pointer group
            ${color.weight >= 3 ? 'col-span-2 row-span-2' : ''}
            ${color.weight === 2 ? 'col-span-2' : ''}
          `}
                    style={{ backgroundColor: color.hex }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2, ease }}
                >
                    <span
                        className="
              absolute inset-0 flex items-center justify-center
              text-xs font-mono opacity-0 group-hover:opacity-100
              transition-opacity mix-blend-difference text-white
            "
                    >
                        {color.hex}
                    </span>
                </motion.button>
            ))}
        </div>
    );
}
