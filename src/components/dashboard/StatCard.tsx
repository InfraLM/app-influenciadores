import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  goal?: number | null;
}

export function StatCard({ title, value, description, icon: Icon, trend, goal }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const hasGoal = goal != null && goal > 0;
  const progressPercent = hasGoal ? Math.min(Math.round((numericValue / goal!) * 100), 100) : null;

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={`mt-1 text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mês anterior
            </p>
          )}
          {hasGoal ? (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Meta: {goal}</span>
                <span className={progressPercent! >= 100 ? 'font-semibold text-success' : ''}>
                  {progressPercent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    progressPercent! >= 100 ? 'bg-success' : progressPercent! >= 50 ? 'bg-primary' : 'bg-warning'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : goal === 0 || goal === null ? (
            <p className="mt-2 text-xs text-muted-foreground italic">Meta não definida</p>
          ) : null}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
