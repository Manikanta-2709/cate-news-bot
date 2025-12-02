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
  Politics: Landmark,
  Sports: Trophy,
  Entertainment: Clapperboard,
  Technology: Cpu,
  Business: Briefcase,
  Health: HeartPulse,
};

interface PredictionResultProps {
  category: string;
  confidence?: number;
}

const PredictionResult = ({ category, confidence }: PredictionResultProps) => {
  const Icon = iconMap[category] || Landmark;

  const colorClasses: Record<string, string> = {
    Politics: 'bg-politics text-white',
    Sports: 'bg-sports text-white',
    Entertainment: 'bg-entertainment text-white',
    Technology: 'bg-technology text-white',
    Business: 'bg-business text-white',
    Health: 'bg-health text-white',
  };

  const bgClasses: Record<string, string> = {
    Politics: 'bg-politics/5 border-politics/20',
    Sports: 'bg-sports/5 border-sports/20',
    Entertainment: 'bg-entertainment/5 border-entertainment/20',
    Technology: 'bg-technology/5 border-technology/20',
    Business: 'bg-business/5 border-business/20',
    Health: 'bg-health/5 border-health/20',
  };

  return (
    <div className={cn(
      'animate-slide-up rounded-xl border-2 p-6',
      bgClasses[category] || 'bg-secondary border-border'
    )}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Predicted Category
        </div>
        <div className={cn(
          'flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg',
          colorClasses[category] || 'bg-primary text-primary-foreground'
        )}>
          <Icon className="h-10 w-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold">{category}</h2>
        {confidence !== undefined && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-border">
              <div 
                className={cn('h-full rounded-full transition-all duration-500', colorClasses[category] || 'bg-primary')}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {(confidence * 100).toFixed(1)}% confidence
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionResult;
