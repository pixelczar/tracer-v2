import { motion } from 'motion/react';
import type { ColorInfo } from '../../shared/types';

const sexyEase = [0.16, 1, 0.3, 1] as const;

interface Props {
  colors: ColorInfo[];
}

export function ColorSection({ colors }: Props) {
  const sorted = [...colors].sort((a, b) => b.weight - a.weight);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
          }
        }
      }}
      className="grid grid-cols-4 gap-1.5"
      style={{ gridAutoRows: '44px' }}
    >
      {sorted.map((color) => (
        <motion.button
          key={color.hex}
          onClick={() => handleCopy(color.hex)}
          variants={{
            hidden: { opacity: 0, y: -4 },
            show: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.16, ease: sexyEase }}
          className={`
            relative cursor-pointer group rounded-lg border border-white/5 shadow-sm
            ${color.weight >= 3 ? 'col-span-2 row-span-2' : ''}
            ${color.weight === 2 ? 'col-span-2' : ''}
          `}
          style={{ backgroundColor: color.hex }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity mix-blend-difference text-white">
            {color.hex}
          </span>
          <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10 pointer-events-none" />
        </motion.button>
      ))}
    </motion.div>
  );
}
