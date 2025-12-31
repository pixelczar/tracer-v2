import { IconSun, IconMoon } from './Icons';

interface Props {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export function ThemePicker({ theme, setTheme }: Props) {
    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="
                w-9 h-9 flex items-center justify-center rounded-md
                text-fg transition-all
            "
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>
    );
}
