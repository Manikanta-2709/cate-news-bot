import { 
  Landmark, 
  Trophy, 
  Clapperboard, 
  Cpu, 
  Briefcase, 
  HeartPulse,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryName } from '@/lib/api';

const iconMap: Record<string, LucideIcon> = {
  landmark: Landmark,
  trophy: Trophy,
  clapperboard: Clapperboard,
  cpu: Cpu,
  briefcase: Briefcase,
  'heart-pulse': HeartPulse,
};

interface CategoryCardProps {
  name: CategoryName;
  color: string;
  icon: string;
  description: string;
  examples: readonly string[];
  delay?: number;
}

const CategoryCard = ({ name, color, icon, description, examples, delay = 0 }: CategoryCardProps) => {
  const Icon = iconMap[icon] || Landmark;

  const colorClasses: Record<string, string> = {
    politics: 'bg-politics/10 text-politics border-politics/20',
    sports: 'bg-sports/10 text-sports border-sports/20',
    entertainment: 'bg-entertainment/10 text-entertainment border-entertainment/20',
    technology: 'bg-technology/10 text-technology border-technology/20',
    business: 'bg-business/10 text-business border-business/20',
    health: 'bg-health/10 text-health border-health/20',
  };

  const iconBgClasses: Record<string, string> = {
    politics: 'bg-politics text-white',
    sports: 'bg-sports text-white',
    entertainment: 'bg-entertainment text-white',
    technology: 'bg-technology text-white',
    business: 'bg-business text-white',
    health: 'bg-health text-white',
  };

  return (
    <div 
      className="animate-slide-up rounded-xl border border-border bg-card p-6 shadow-sm card-hover"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-lg', iconBgClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-xl font-semibold">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Example Headlines
        </span>
        <ul className="space-y-2">
          {examples.map((example, idx) => (
            <li
              key={idx}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm',
                colorClasses[color]
              )}
            >
              {example}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryCard;
