import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import type { ColorInfo } from '../../shared/types';

const sexyEase = [0.16, 1, 0.3, 1] as const;
const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  colors: ColorInfo[];
  maxColors?: number;
  maxLarge?: number;
}

function ColorTooltip({ hex, visible }: { hex: string; visible: boolean }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (!visible) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX + 12);
      cursorY.set(e.clientY + 12);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [cursorX, cursorY, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9999] bg-[#0a0a0a] text-[#f0f0f0] px-3 py-1.5 text-2xs font-mono uppercase tracking-wider rounded-full shadow-lg border border-white/5"
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1, ease }}
        >
          {hex}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ColorSection({ colors, maxColors = 8, maxLarge = 2 }: Props) {
  const [hoveredHex, setHoveredHex] = useState<string | null>(null);
  const sorted = [...colors]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxColors);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
  };

  // Track how many large swatches we've created
  let largeCount = 0;

  return (
    <>
      <ColorTooltip hex={hoveredHex || ''} visible={hoveredHex !== null} />
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          show: {
            transition: {
              staggerChildren: 0.04,
              delayChildren: 0.3
            }
          }
        }}
        className="grid grid-cols-8 gap-2"
        style={{ gridAutoRows: '32px' }}
      >
        {sorted.map((color) => {
          // Determine if this should be a large swatch
          const shouldBeLarge = color.weight >= 3 && largeCount < maxLarge;
          if (shouldBeLarge) {
            largeCount++;
          }

          return (
            <motion.button
              key={color.hex}
              onClick={() => handleCopy(color.hex)}
              onMouseEnter={() => setHoveredHex(color.hex)}
              onMouseLeave={() => setHoveredHex(null)}
              variants={{
                hidden: { opacity: 0, y: 8, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.7, ease: sexyEase }}
              className={`
                relative cursor-pointer group rounded-md border border-white/5
                ${shouldBeLarge ? 'col-span-2 row-span-2' : ''}
                ${color.weight === 2 && !shouldBeLarge ? 'col-span-2' : ''}
              `}
              style={{ backgroundColor: color.hex }}
            >
              <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/10 pointer-events-none" />
            </motion.button>
          );
        })}
      </motion.div>
    </>
  );
}
