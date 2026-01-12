import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconDots, IconClose, IconSun, IconMoon, IconChevronDown } from './Icons';
import { getSettings, updateSettings, type Settings } from '../../shared/settings';
import { TECH_CATEGORY_META, type TechCategory } from '../../shared/types';

const sexyEase = [0.16, 1, 0.3, 1] as const;

// Component for checkbox with indeterminate state support
function IndeterminateCheckbox({ 
    checked, 
    indeterminate, 
    onChange 
}: { 
    checked: boolean; 
    indeterminate: boolean; 
    onChange: () => void;
}) {
    const checkboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return (
        <div className="relative">
            <input
                ref={checkboxRef}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only"
            />
            <div className={`
                w-3.5 h-3.5 rounded border transition-all flex items-center justify-center
                ${checked || indeterminate
                    ? 'bg-accent/10 border-transparent' 
                    : 'bg-transparent border-faint'
                }
            `}>
                {checked && (
                    <svg 
                        className="w-full h-full text-accent" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {indeterminate && !checked && (
                    <svg 
                        className="w-full h-full text-accent" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                )}
            </div>
        </div>
    );
}

interface Props {
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    onRescan?: () => void;
    onOpenChange?: (isOpen: boolean) => void;
}

export function SettingsPopover({ theme, onThemeChange, onRescan, onOpenChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>(getSettings());
    const [initialSettings, setInitialSettings] = useState<Settings>(getSettings());
    const [isDirty, setIsDirty] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Notify parent of open state changes
    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    // Load settings on mount
    useEffect(() => {
        const currentSettings = getSettings();
        setSettings(currentSettings);
        setInitialSettings(currentSettings);
    }, []);

    // Reset dirty state when opening
    useEffect(() => {
        if (isOpen) {
            const currentSettings = getSettings();
            setInitialSettings(currentSettings);
            setIsDirty(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (isDirty && onRescan) {
            // Check if only theme changed - if so, don't rescan
            const currentSettings = getSettings();
            const onlyThemeChanged = 
                JSON.stringify({ ...currentSettings, theme: initialSettings.theme }) === 
                JSON.stringify(initialSettings);
            
            if (!onlyThemeChanged) {
                setTimeout(() => onRescan(), 100);
            }
        }
        setIsOpen(false);
    };

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                buttonRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                handleClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isDirty, onRescan]);

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        const updated = updateSettings({ [key]: value });
        setSettings(updated);
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('tracer:settings-changed'));
        // Mark as dirty if any setting changed
        const hasChanged = JSON.stringify(updated) !== JSON.stringify(initialSettings);
        setIsDirty(hasChanged);
    };

    const toggleGroupCategories = (groupName: string) => {
        const groupCategories = categoriesByGroup[groupName].map(c => c.key);
        const allHidden = groupCategories.every(cat => settings.hiddenCategories.includes(cat));
        const newHidden = allHidden
            ? settings.hiddenCategories.filter(c => !groupCategories.includes(c))
            : [...new Set([...settings.hiddenCategories, ...groupCategories])];
        updateSetting('hiddenCategories', newHidden);
    };

    const toggleCategory = (category: TechCategory) => {
        const newHidden = settings.hiddenCategories.includes(category)
            ? settings.hiddenCategories.filter(c => c !== category)
            : [...settings.hiddenCategories, category];
        updateSetting('hiddenCategories', newHidden);
    };

    const getGroupCheckState = (groupName: string) => {
        const groupCategories = categoriesByGroup[groupName].map(c => c.key);
        const hiddenCount = groupCategories.filter(cat => settings.hiddenCategories.includes(cat)).length;
        if (hiddenCount === 0) return 'checked'; // All visible
        if (hiddenCount === groupCategories.length) return 'unchecked'; // All hidden
        return 'indeterminate'; // Some hidden
    };

    const toggleGroupExpanded = (groupName: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    };

    // Get all categories grouped
    const categoriesByGroup = Object.entries(TECH_CATEGORY_META).reduce((acc, [key, meta]) => {
        if (!acc[meta.group]) acc[meta.group] = [];
        acc[meta.group].push({ key: key as TechCategory, label: meta.label });
        return acc;
    }, {} as Record<string, { key: TechCategory; label: string }[]>);

    const groupOrder = ['Frontend', 'Styling', 'Graphics', 'Content', 'Analytics', 'Marketing', 'Commerce', 'Infra', 'Security', 'Developer', 'Misc', 'AI'];
    const sortedGroups = groupOrder.filter(g => categoriesByGroup[g]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="
                    w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0
                    text-fg opacity-40 transition-all
                    border border-transparent hover:opacity-100
                "
                title="Settings"
            >
                <IconDots />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: sexyEase }}
                        className="absolute right-[-4px] w-80 top-0 bg-bg border border-faint rounded-lg shadow-xl z-[100] overflow-hidden flex flex-col"
                        style={{ 
                            maxHeight: 'calc(100vh - 80px)',
                            minHeight: '500px'
                        }}
                    >
                            <div className="overflow-y-auto flex-1">
                            {/* Header */}
                            <div className="pl-4 py-3 border-b border-faint flex items-center justify-between">
                                <h3 className="text-sm font-medium text-muted">Settings</h3>
                                <button
                                    onClick={handleClose}
                                    className="mr-2 w-6 h-6 flex items-center justify-center rounded-md text-fg opacity-60 hover:opacity-100 transition-opacity"
                                    title="Close"
                                >
                                    <IconClose className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Theme Section */}
                            <div className="px-4 py-3 border-b border-faint">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-fg block mb-1">Theme</label>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => {
                                                if (theme !== 'light') {
                                                    updateSetting('theme', 'light');
                                                    onThemeChange('light');
                                                    handleClose();
                                                }
                                            }}
                                            className={`
                                                px-2 py-1 rounded-md text-xs font-medium transition-all
                                                ${theme === 'light'
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'bg-subtle'
                                                }
                                            `}
                                            title="Light"
                                        >
                                            <IconSun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-accent' : 'text-muted'}`} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (theme !== 'dark') {
                                                    updateSetting('theme', 'dark');
                                                    onThemeChange('dark');
                                                    handleClose();
                                                }
                                            }}
                                            className={`
                                                px-2 py-1 rounded-md text-xs font-medium transition-all
                                                ${theme === 'dark'
                                                    ? 'bg-accent/20 text-accent'
                                                    : 'bg-subtle'
                                                }
                                            `}
                                            title="Dark"
                                        >
                                            <IconMoon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-accent' : 'text-muted'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Deep Scan Section */}
                            <div className="px-4 py-3 border-b border-faint">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-fg block mb-1">Deep Scan</label>
                                        <p className="text-xs text-muted leading-relaxed">
                                            More thorough detection that takes longer but finds more technologies.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => updateSetting('deepScan', !settings.deepScan)}
                                        className={`
                                            relative w-7 h-4 rounded-full transition-colors flex-shrink-0
                                            ${settings.deepScan ? 'bg-accent/20' : 'bg-faint'}
                                        `}
                                    >
                                        <motion.div
                                            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full shadow-sm ${settings.deepScan ? 'bg-accent' : 'bg-black'}`}
                                            animate={{ x: settings.deepScan ? 12 : 0 }}
                                            transition={{ duration: 0.2, ease: sexyEase }}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Font Preview Section */}
                            <div className="px-4 py-3 border-b border-faint">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-fg block mb-1">Font Preview Source</label>
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        value={settings.fontPreviewSource}
                                        onChange={(e) => updateSetting('fontPreviewSource', e.target.value as Settings['fontPreviewSource'])}
                                        className="w-full px-3 py-2 pr-8 text-xs bg-subtle border border-faint rounded-md text-muted focus:outline-none appearance-none cursor-pointer"
                                        style={{
                                            '--tw-ring-color': 'var(--accent)'
                                        } as React.CSSProperties & { '--tw-ring-color'?: string }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'color-mix(in srgb, var(--accent) 50%, var(--faint))';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '';
                                        }}
                                    >
                                        <option value="pangram">Pangram</option>
                                        <option value="og-description">OG Description</option>
                                        <option value="page-content">Page Content</option>
                                    </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <IconChevronDown className="w-3.5 h-3.5 text-muted" />
                                    </div>
                                </div>
                            </div>

                            {/* Category Filters Section */}
                            <div className="px-4 py-3">
                                <label className="text-xs font-medium text-fg block mb-1">Tech Categories</label>
                                <div className="mt-4">
                                    {sortedGroups.map((groupName) => {
                                        const checkState = getGroupCheckState(groupName);
                                        const isExpanded = expandedGroups.has(groupName);
                                        return (
                                            <div key={groupName} className="group">
                                                <div className="flex items-center gap-2 px-1 py-1">
                                                    <label className="flex items-center gap-2 flex cursor-pointer rounded">
                                                        <IndeterminateCheckbox
                                                            checked={checkState === 'checked'}
                                                            indeterminate={checkState === 'indeterminate'}
                                                            onChange={() => toggleGroupCategories(groupName)}
                                                        />
                                                        <span className="text-xs font-medium text-muted">{groupName}</span>
                                                    </label>
                                                    <button
                                                        onClick={() => toggleGroupExpanded(groupName)}
                                                        className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-fg transition-colors opacity-0 group-hover:opacity-100"
                                                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                                    >
                                                        <motion.div
                                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                                            transition={{ duration: 0.2, ease: sexyEase }}
                                                        >
                                                            <IconChevronDown className="w-3 h-3" />
                                                        </motion.div>
                                                    </button>
                                                </div>
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2, ease: sexyEase }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 ml-6 mt-1 pb-1">
                                                                {categoriesByGroup[groupName].map(({ key, label }) => {
                                                                    const isHidden = settings.hiddenCategories.includes(key);
                                                                    return (
                                                                        <label
                                                                            key={key}
                                                                            className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-muted cursor-pointer hover:text-fg transition-colors"
                                                                        >
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!isHidden}
                                                                                    onChange={() => toggleCategory(key)}
                                                                                    className="sr-only"
                                                                                />
                                                                                <div className={`
                                                                                    w-3.5 h-3.5 rounded border transition-all flex items-center justify-center
                                                                                    ${!isHidden 
                                                                                        ? 'bg-accent/10 border-transparent' 
                                                                                        : 'bg-transparent border-faint'
                                                                                    }
                                                                                `}>
                                                                                    {!isHidden && (
                                                                                        <svg 
                                                                                            className="w-full h-full text-accent" 
                                                                                            fill="none" 
                                                                                            viewBox="0 0 24 24" 
                                                                                            stroke="currentColor" 
                                                                                            strokeWidth="2.5"
                                                                                        >
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                        </svg>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <span>{label}</span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

