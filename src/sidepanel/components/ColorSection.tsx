import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import type { ColorInfo } from '../../shared/types';

const sexyEase = [0.16, 1, 0.3, 1] as const;
const ease = [0.22, 1, 0.36, 1] as const;

// Color conversion utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToRgba(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

function rgbToHsl(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function rgbToOklch(hex: string): string {
  // Convert RGB to linear RGB
  const { r, g, b } = hexToRgb(hex);
  const linearR = r / 255;
  const linearG = g / 255;
  const linearB = b / 255;

  // Convert to sRGB (gamma correction)
  const srgbR = linearR <= 0.04045 ? linearR / 12.92 : Math.pow((linearR + 0.055) / 1.055, 2.4);
  const srgbG = linearG <= 0.04045 ? linearG / 12.92 : Math.pow((linearG + 0.055) / 1.055, 2.4);
  const srgbB = linearB <= 0.04045 ? linearB / 12.92 : Math.pow((linearB + 0.055) / 1.055, 2.4);

  // Convert to linear RGB to OKLab
  const labL = 0.4122214708 * srgbR + 0.5363325363 * srgbG + 0.0514459929 * srgbB;
  const labM = 0.2119034982 * srgbR + 0.6806995451 * srgbG + 0.1073969566 * srgbB;
  const labS = 0.0883024619 * srgbR + 0.2817188376 * srgbG + 0.6299787005 * srgbB;

  const l_ = Math.cbrt(labL);
  const m_ = Math.cbrt(labM);
  const s_ = Math.cbrt(labS);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bLab * bLab);
  let h = Math.atan2(bLab, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${h.toFixed(2)})`;
}

function getColorFormats(hex: string): { label: string; value: string }[] {
  return [
    { label: 'Hex', value: hex },
    { label: 'rgba', value: rgbToRgba(hex) },
    { label: 'oklch', value: rgbToOklch(hex) },
    { label: 'hsl', value: rgbToHsl(hex) },
  ];
}

interface Props {
  colors: ColorInfo[];
  maxColors?: number;
  maxLarge?: number;
  theme?: 'light' | 'dark';
}

function ColorTooltip({ 
  hex, 
  visible, 
  copiedIndex 
}: { 
  hex: string; 
  visible: boolean; 
  copiedIndex: number | null;
}) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const springConfig = { damping: 25, stiffness: 400 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  const formats = getColorFormats(hex);

  useEffect(() => {
    if (!visible) return;

    const updatePosition = (clientX: number, clientY: number) => {
      // Use requestAnimationFrame to ensure tooltip is rendered
      requestAnimationFrame(() => {
        if (!tooltipRef.current) {
          // Fallback if ref not ready
          cursorX.set(clientX + 12);
          cursorY.set(clientY + 12);
          return;
        }
        
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const offsetX = 12;
        const offsetY = 12;
        
        let adjustedX = clientX + offsetX;
        let adjustedY = clientY + offsetY;
        
        // Check right edge
        if (adjustedX + tooltipRect.width > viewportWidth) {
          adjustedX = clientX - tooltipRect.width - offsetX;
        }
        
        // Check left edge
        if (adjustedX < 0) {
          adjustedX = offsetX;
        }
        
        // Check bottom edge
        if (adjustedY + tooltipRect.height > viewportHeight) {
          adjustedY = clientY - tooltipRect.height - offsetY;
        }
        
        // Check top edge
        if (adjustedY < 0) {
          adjustedY = offsetY;
        }
        
        cursorX.set(adjustedX);
        cursorY.set(adjustedY);
      });
    };

    const move = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };
    
    window.addEventListener('mousemove', move);
    
    // Also update on resize/scroll to handle edge cases
    const handleResize = () => {
      // Get current cursor position from motion values
      const currentX = cursorX.get();
      const currentY = cursorY.get();
      if (currentX > 0 && currentY > 0) {
        // Estimate cursor position (approximate)
        updatePosition(currentX - 12, currentY - 12);
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [cursorX, cursorY, visible, hex, copiedIndex]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={tooltipRef}
          className="fixed top-0 left-0 pointer-events-none z-[9999] bg-[#0a0a0a] text-muted px-3 py-2 text-2xs font-mono shadow-lg border border-white/5 rounded-lg"
          style={{ x, y, minWidth: '180px' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1, ease }}
        >
          {/* Format list */}
          <div className="flex flex-col gap-1">
            {formats.map((format, index) => {
              const isCopied = copiedIndex === index;
              const isHex = index === 0;
              
              return (
                <div 
                  key={format.label} 
                  className={isHex ? 'uppercase tracking-wider' : 'text-[10px]'}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.3, ease: sexyEase }}
                        className="inline-block min-w-[150px]"
                      >
                        COPIED
                      </motion.span>
                    ) : (
                      <motion.span
                        key="value"
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2 }}
                        transition={{ duration: 0.3, ease: sexyEase }}
                        className="inline-block min-w-[150px]"
                      >
                        {format.value}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ColorSection({ colors, maxColors = 8, maxLarge = 2, theme = 'dark' }: Props) {
  const [hoveredHex, setHoveredHex] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [formatIndexMap, setFormatIndexMap] = useState<Map<string, number>>(new Map());
  const [selectorPosition, setSelectorPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const swatchRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const sorted = [...colors]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxColors);

  const handleCopy = (hex: string) => {
    // Get current format index for this color (default to 0 if not set)
    const currentIndex = formatIndexMap.get(hex) ?? 0;
    const formats = getColorFormats(hex);
    const formatToCopy = formats[currentIndex];
    
    navigator.clipboard.writeText(formatToCopy.value);
    
    // Clear any existing timeout
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    
    // Set copied state and ensure hex is hovered for tooltip display
    setCopiedIndex(currentIndex);
    setHoveredHex(hex);
    
    // Cycle to next format index for next click
    const nextIndex = (currentIndex + 1) % formats.length;
    setFormatIndexMap(new Map(formatIndexMap.set(hex, nextIndex)));
    
    // Reset after very short delay - show "Copied" briefly then return to value
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedIndex(null);
      // Don't clear hoveredHex here - let mouse leave handle it
    }, 800);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Determine corner color based on extension theme
  // Dark mode: white with opacity, Light mode: dark with opacity
  const cornerColor = theme === 'dark' ? 'rgba(240, 240, 240, 0.8)' : 'rgba(10, 10, 10, 0.8)';

  // Update selector position when hovered hex changes
  useEffect(() => {
    if (!hoveredHex) {
      setSelectorPosition(null);
      return;
    }

    const swatchElement = swatchRefs.current.get(hoveredHex);
    const containerElement = containerRef.current;
    
    if (swatchElement && containerElement) {
      const swatchRect = swatchElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      
      setSelectorPosition({
        x: swatchRect.left - containerRect.left,
        y: swatchRect.top - containerRect.top,
        width: swatchRect.width,
        height: swatchRect.height,
      });
    }
  }, [hoveredHex]);

  // Track how many large swatches we've created
  let largeCount = 0;

  return (
    <>
      <ColorTooltip 
        hex={hoveredHex || ''} 
        visible={hoveredHex !== null || copiedIndex !== null} 
        copiedIndex={copiedIndex}
      />
      <div ref={containerRef} className="relative">
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
          className="grid grid-cols-9 gap-1.5"
          style={{ gridAutoRows: '24px' }}
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
              ref={(el) => {
                if (el) {
                  swatchRefs.current.set(color.hex, el);
                } else {
                  swatchRefs.current.delete(color.hex);
                }
              }}
              onClick={() => handleCopy(color.hex)}
              onMouseEnter={() => {
                // Only update hoveredHex if not showing copy feedback
                if (copiedIndex === null) {
                  setHoveredHex(color.hex);
                  // Reset format index when hovering a different color
                  if (!formatIndexMap.has(color.hex)) {
                    setFormatIndexMap(new Map(formatIndexMap.set(color.hex, 0)));
                  }
                }
              }}
              onMouseLeave={() => {
                // Only clear hoveredHex if not showing copy feedback
                if (copiedIndex === null) {
                  setHoveredHex(null);
                }
              }}
              variants={{
                hidden: { opacity: 0, y: 8, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1 }
              }}
              transition={{ duration: 0.7, ease: sexyEase }}
              className={`
                relative cursor-pointer rounded-smX border border-white/10
                ${shouldBeLarge ? 'col-span-2 row-span-2' : ''}
                ${color.weight === 2 && !shouldBeLarge ? 'col-span-2' : ''}
              `}
              style={{ backgroundColor: color.hex }}
            >
              <div className="absolute inset-0 rounded-sm ring-1 ring-inset ring-black/20 pointer-events-none" />
            </motion.button>
          );
        })}
        </motion.div>
        
        {/* Single animated selector */}
        <AnimatePresence>
          {selectorPosition && (
            <motion.div
              className="absolute pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                left: selectorPosition.x,
                top: selectorPosition.y,
                width: selectorPosition.width,
                height: selectorPosition.height,
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.25, 
                ease: ease,
                opacity: { duration: 0.15 }
              }}
            >
              {/* Top-left corner */}
              <div
                className="absolute w-2 h-2"
                style={{
                  top: -2,
                  left: -2,
                  borderTop: `1px solid ${cornerColor}`,
                  borderLeft: `1px solid ${cornerColor}`,
                  borderRight: 'none',
                  borderBottom: 'none',
                }}
              />
              {/* Top-right corner */}
              <div
                className="absolute w-2 h-2"
                style={{
                  top: -2,
                  right: -2,
                  borderTop: `1px solid ${cornerColor}`,
                  borderRight: `1px solid ${cornerColor}`,
                  borderLeft: 'none',
                  borderBottom: 'none',
                }}
              />
              {/* Bottom-left corner */}
              <div
                className="absolute w-2 h-2"
                style={{
                  bottom: -2,
                  left: -2,
                  borderBottom: `1px solid ${cornerColor}`,
                  borderLeft: `1px solid ${cornerColor}`,
                  borderRight: 'none',
                  borderTop: 'none',
                }}
              />
              {/* Bottom-right corner */}
              <div
                className="absolute w-2 h-2"
                style={{
                  bottom: -2,
                  right: -2,
                  borderBottom: `1px solid ${cornerColor}`,
                  borderRight: `1px solid ${cornerColor}`,
                  borderLeft: 'none',
                  borderTop: 'none',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
