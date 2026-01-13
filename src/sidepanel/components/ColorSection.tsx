import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import type { ColorInfo } from '../../shared/types';
import { getSettings } from '../../shared/settings';

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

function getColorFormats(hex: string): { label: string; value: string; key: string }[] {
  const settings = getSettings();
  const allFormats = [
    { label: 'Hex', value: hex, key: 'hex' },
    { label: 'rgba', value: rgbToRgba(hex), key: 'rgba' },
    { label: 'oklch', value: rgbToOklch(hex), key: 'oklch' },
    { label: 'hsl', value: rgbToHsl(hex), key: 'hsl' },
  ];
  
  // Filter out hidden formats
  return allFormats.filter(format => !settings.hiddenColorFormats.includes(format.key as any));
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
  copiedFormatKey,
  initialPosition
}: { 
  hex: string; 
  visible: boolean; 
  copiedFormatKey: string | null;
  initialPosition?: { x: number; y: number } | null;
}) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);
  const [hasInitialPosition, setHasInitialPosition] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [tooltipWidth, setTooltipWidth] = useState<number | null>(null);

  const springConfig = { damping: 25, stiffness: 400 };
  // Use direct motion values until initial position is set, then switch to spring
  const xSpring = useSpring(cursorX, springConfig);
  const ySpring = useSpring(cursorY, springConfig);
  const x = shouldAnimate ? xSpring : cursorX;
  const y = shouldAnimate ? ySpring : cursorY;

  // Listen for settings changes to update formats
  useEffect(() => {
    const handleSettingsChange = () => {
      forceUpdate(n => n + 1);
    };
    window.addEventListener('tracer:settings-changed', handleSettingsChange);
    return () => window.removeEventListener('tracer:settings-changed', handleSettingsChange);
  }, []);

  const formats = getColorFormats(hex);

  // Measure the width of all format values to determine tooltip width
  useEffect(() => {
    if (formats.length === 0) return;

    // Use requestAnimationFrame to ensure fonts are loaded
    requestAnimationFrame(() => {
      // Create a temporary span to measure text width
      const measureElement = document.createElement('span');
      measureElement.style.position = 'absolute';
      measureElement.style.visibility = 'hidden';
      measureElement.style.whiteSpace = 'nowrap';
      measureElement.style.display = 'inline-block';
      measureElement.style.fontSize = '10px';
      measureElement.style.fontFamily = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
      measureElement.style.padding = '0';
      measureElement.style.margin = '0';
      measureElement.style.top = '-9999px';
      measureElement.style.left = '-9999px';
      document.body.appendChild(measureElement);

      let maxContentWidth = 0;

      formats.forEach((format) => {
        // Measure the actual value with proper styling
        measureElement.textContent = format.value;
        measureElement.style.textTransform = format.key === 'hex' ? 'uppercase' : 'none';
        measureElement.style.letterSpacing = format.key === 'hex' ? '0.05em' : 'normal';
        
        // Use offsetWidth for more accurate measurement
        const width = measureElement.offsetWidth;
        maxContentWidth = Math.max(maxContentWidth, width);
      });

      // Add padding (px-3 = 12px on each side = 24px total) + buffer for subpixel rendering
      setTooltipWidth(Math.ceil(maxContentWidth) + 24 + 2);

      document.body.removeChild(measureElement);
    });
  }, [formats, hex]);

  useEffect(() => {
    if (!visible) {
      setHasInitialPosition(false);
      setShouldAnimate(false);
      return;
    }

    const updatePosition = (clientX: number, clientY: number, immediate = false) => {
      // Use requestAnimationFrame to ensure tooltip is rendered
      requestAnimationFrame(() => {
          if (!tooltipRef.current) {
            // Fallback if ref not ready
            if (immediate) {
              const posX = clientX + 12;
              const posY = clientY + 12;
              cursorX.jump(posX);
              cursorY.jump(posY);
              // Sync spring values to current position before enabling spring
              xSpring.jump(posX);
              ySpring.jump(posY);
              setHasInitialPosition(true);
              // Enable spring animation after initial position is set
              setTimeout(() => setShouldAnimate(true), 50);
            } else {
              cursorX.set(clientX + 12);
              cursorY.set(clientY + 12);
            }
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
        
          if (immediate) {
            // Set position immediately without spring for initial positioning
            cursorX.jump(adjustedX);
            cursorY.jump(adjustedY);
            // Sync spring values to current position before enabling spring
            xSpring.jump(adjustedX);
            ySpring.jump(adjustedY);
            setHasInitialPosition(true);
            // Enable spring animation after initial position is set
            setTimeout(() => setShouldAnimate(true), 50);
          } else {
            cursorX.set(adjustedX);
            cursorY.set(adjustedY);
          }
      });
    };
    
    // Delay before positioning to avoid (0,0) flash
    // This gives the tooltip time to render and calculate its position
    const delayTimeout = setTimeout(() => {
      // Set initial position immediately if we have it
      if (initialPosition && !hasInitialPosition) {
        updatePosition(initialPosition.x, initialPosition.y, true);
      }
    }, 150);
    
    const move = (e: MouseEvent) => {
      if (!hasInitialPosition) {
        updatePosition(e.clientX, e.clientY, true);
      } else {
        updatePosition(e.clientX, e.clientY);
      }
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
      clearTimeout(delayTimeout);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [cursorX, cursorY, visible, hex, copiedFormatKey, hasInitialPosition, initialPosition]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
            ref={tooltipRef}
            className="fixed top-0 left-0 pointer-events-none z-[9999] bg-[#0a0a0a] text-muted px-3 py-2 text-2xs font-mono shadow-lg border border-white/5 rounded-lg"
            style={{ 
              x, 
              y, 
              width: tooltipWidth ? `${tooltipWidth}px` : 'auto',
              minWidth: tooltipWidth ? `${tooltipWidth}px` : '180px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: hasInitialPosition ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: sexyEase }}
          >
            {/* Format list */}
            <div className="flex flex-col gap-1">
            {formats.map((format) => {
              const isCopied = copiedFormatKey === format.key;
              const isHex = format.key === 'hex';
              
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
                        className="inline-block"
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
                        className="inline-block"
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
  const [copiedFormatKey, setCopiedFormatKey] = useState<string | null>(null);
  const [formatKeyMap, setFormatKeyMap] = useState<Map<string, string>>(new Map());
  const [selectorPosition, setSelectorPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const swatchRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Listen for settings changes to reset format selections if needed
  useEffect(() => {
    const handleSettingsChange = () => {
      // Reset format selections for colors where the selected format is now hidden
      setFormatKeyMap(prev => {
        const updated = new Map(prev);
        prev.forEach((formatKey, hex) => {
          const formats = getColorFormats(hex);
          const formatExists = formats.some(f => f.key === formatKey);
          if (!formatExists && formats.length > 0) {
            // Reset to first available format
            updated.set(hex, formats[0].key);
          } else if (!formatExists) {
            // No formats available, remove entry
            updated.delete(hex);
          }
        });
        return updated;
      });
    };
    window.addEventListener('tracer:settings-changed', handleSettingsChange);
    return () => window.removeEventListener('tracer:settings-changed', handleSettingsChange);
  }, []);
  
  const sorted = [...colors]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxColors);

  const handleCopy = (hex: string) => {
    const formats = getColorFormats(hex);
    if (formats.length === 0) return;
    
    // Get current format key for this color (default to first format if not set)
    const currentFormatKey = formatKeyMap.get(hex) ?? formats[0].key;
    
    // Find the current format or use the first one
    let currentFormatIndex = formats.findIndex(f => f.key === currentFormatKey);
    if (currentFormatIndex === -1) {
      currentFormatIndex = 0;
    }
    
    const formatToCopy = formats[currentFormatIndex];
    
    navigator.clipboard.writeText(formatToCopy.value);
    
    // Clear any existing timeout
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    
    // Set copied state and ensure hex is hovered for tooltip display
    setCopiedFormatKey(formatToCopy.key);
    setHoveredHex(hex);
    
    // Cycle to next format for next click
    const nextIndex = (currentFormatIndex + 1) % formats.length;
    const nextFormatKey = formats[nextIndex].key;
    setFormatKeyMap(new Map(formatKeyMap.set(hex, nextFormatKey)));
    
    // Reset after very short delay - show "Copied" briefly then return to value
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedFormatKey(null);
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
        visible={hoveredHex !== null || copiedFormatKey !== null} 
        copiedFormatKey={copiedFormatKey}
        initialPosition={cursorPosition}
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
              onMouseEnter={(e) => {
                // Only update hoveredHex if not showing copy feedback
                if (copiedFormatKey === null) {
                  setHoveredHex(color.hex);
                  // Capture cursor position for tooltip
                  setCursorPosition({ x: e.clientX, y: e.clientY });
                  // Reset format key when hovering a different color if not set
                  if (!formatKeyMap.has(color.hex)) {
                    const formats = getColorFormats(color.hex);
                    if (formats.length > 0) {
                      setFormatKeyMap(new Map(formatKeyMap.set(color.hex, formats[0].key)));
                    }
                  }
                }
              }}
              onMouseLeave={() => {
                // Only clear hoveredHex if not showing copy feedback
                if (copiedFormatKey === null) {
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
