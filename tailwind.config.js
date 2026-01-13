/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
    content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)',
                fg: 'var(--fg)',
                muted: 'var(--muted)',
                faint: 'var(--faint)',
                subtle: 'var(--subtle)',
                accent: 'var(--accent)',
                highlight: {
                    dark: '#eaff00',
                    light: '#2684ff',
                },
            },
            fontFamily: {
                sans: ['Geist Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                mono: ['IBM Plex Mono', 'monospace'],
            },
            fontSize: {
                '2xs': '10px',
                '3xs': '9px',
                '4xs': '8px',
            },
            animation: {
                shimmer: 'shimmer 1s ease infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
            },
        },
    },
    plugins: [
        plugin(function({ addUtilities }) {
            // Generate opacity modifier utilities for accent color (10, 20, 30, ..., 100)
            const utilities = {};
            const properties = ['bg', 'border', 'text'];
            
            for (let opacity = 10; opacity <= 100; opacity += 10) {
                properties.forEach(prop => {
                    const className = `.${prop}-accent\\/${opacity}`;
                    utilities[className] = {
                        [prop === 'bg' ? 'backgroundColor' : prop === 'border' ? 'borderColor' : 'color']: 
                            `color-mix(in srgb, var(--accent) ${opacity}%, transparent)`,
                    };
                });
            }
            
            addUtilities(utilities);
        }),
    ],
};
