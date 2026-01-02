/** @type {import('tailwindcss').Config} */
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
    plugins: [],
};
