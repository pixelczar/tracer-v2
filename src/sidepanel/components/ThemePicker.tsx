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
                w-8 h-8 flex items-center justify-center rounded-md
                text-fg opacity-60 transition-all
                border border-transparent hover:border-faint hover:opacity-100
            "
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>
    );
}
