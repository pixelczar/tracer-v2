import { IconSun, IconMoon } from './Icons';

interface Props {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

export function ThemePicker({ theme, setTheme }: Props) {
    return (
        <div className="flex gap-0.5">
            <button
                onClick={() => setTheme('light')}
                className={`
          w-7 h-7 flex items-center justify-center
          border border-transparent transition-all
          ${theme === 'light' ? 'text-fg border-faint' : 'text-muted hover:text-fg'}
        `}
            >
                <IconSun />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`
          w-7 h-7 flex items-center justify-center
          border border-transparent transition-all
          ${theme === 'dark' ? 'text-fg border-faint' : 'text-muted hover:text-fg'}
        `}
            >
                <IconMoon />
            </button>
        </div>
    );
}
