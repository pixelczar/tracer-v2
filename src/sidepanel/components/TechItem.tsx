import { IconArrow } from './Icons';
import { TECH_CATEGORY_META, type TechInfo } from '../../shared/types';

interface Props {
  tech: TechInfo;
}

export function TechItem({ tech }: Props) {
  const meta = TECH_CATEGORY_META[tech.category];
  const isUncertain = tech.confidence < 80;

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-faint last:border-0 group">
      <div className="flex items-center gap-2">
        {tech.icon && (
          <img src={tech.icon} alt="" className="w-4 h-4 rounded-sm" />
        )}

        <span className="flex items-center gap-1.5 font-medium text-[13px]">
          {tech.isSignal && <span className="text-accent text-2xs">✦</span>}
          {tech.name}
          {tech.version && (
            <span className="text-muted text-2xs font-mono">{tech.version}</span>
          )}

          <a
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted opacity-40 group-hover:opacity-100 transition-opacity"
          >
            <IconArrow />
          </a>
        </span>

        {isUncertain && (
          <span className="text-xs font-mono text-muted bg-faint px-1.5 py-0.5 rounded">
            {tech.confidence}% sure
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xs font-mono text-muted uppercase">
          {meta?.label || tech.category}
        </span>

      </div>
    </div>
  );
}
