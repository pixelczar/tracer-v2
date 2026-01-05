import { IconArrow } from './Icons';
import { TECH_CATEGORY_META, type TechInfo } from '../../shared/types';
import { getTechIcon } from '../../shared/techIcons';

interface Props {
  tech: TechInfo;
}

export function TechItem({ tech }: Props) {
  const meta = TECH_CATEGORY_META[tech.category];
  const isUncertain = tech.confidence < 80;
  const iconUrl = getTechIcon(tech.name);

  return (
    <div className="tech-item flex flex-col py-1.5 border-b border-faint last:border-0 min-w-0 w-full">
      <div className="flex items-center gap-2 group min-w-0 w-full">
        {/* Icon */}
        <div className="flex-shrink-0 w-3 h-3 flex items-center justify-center">
          {iconUrl ? (
            <img 
              src={iconUrl} 
              alt="" 
              className="w-3 h-3 object-contain rounded-sm" 
              loading="lazy"
              onError={(e) => {
                // Hide broken images
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-3 h-3 rounded-sm bg-faint opacity-50" />
          )}
        </div>

        {/* Name + Version + Link */}
        <span className={`flex items-center gap-1.5 text-[13px] min-w-0 flex-1 overflow-hidden ${tech.isSignal ? 'font-semibold text-fg' : 'font-medium'}`}>
          <span className="truncate min-w-0" title={tech.name}>{tech.name}</span>
          {tech.isSignal && <span className="text-accent text-2xs flex-shrink-0 -ml-0.5 -mt-2">✦</span>}
          {tech.version && (
            <span className="text-muted text-2xs font-mono flex-shrink-0">{tech.version}</span>
          )}
          <a
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-accent flex-shrink-0"
            title={tech.url}
          >
            <IconArrow />
          </a>
        </span>

        {isUncertain && (
          <span className="text-xs font-mono text-muted bg-faint px-1.5 py-0.5 rounded flex-shrink-0">
            {tech.confidence}%
          </span>
        )}

        {/* Category label - shown on wider screens inline */}
        <span className="category-inline ml-auto text-2xs font-mono text-muted uppercase flex-shrink-0">
          {meta?.label || tech.category}
        </span>
      </div>

      {/* Category label - shown on narrow screens below the name */}
      <span className="category-block text-2xs font-mono text-muted uppercase pl-5 truncate" title={meta?.label || tech.category}>
        {meta?.label || tech.category}
      </span>
    </div>
  );
}
