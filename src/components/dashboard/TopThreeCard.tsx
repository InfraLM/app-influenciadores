import { Trophy } from 'lucide-react';
import { RankingEntry } from '@/types';

interface TopThreeCardProps {
  entries: RankingEntry[];
}

export function TopThreeCard({ entries }: TopThreeCardProps) {
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
      case 3:
        return 'bg-amber-700/20 text-amber-600 border-amber-600/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="stat-card animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Top 3 do Mês</h3>
      </div>
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
        ) : (
          entries.slice(0, 3).map((entry) => (
            <div
              key={entry.influencerId}
              className="flex items-center gap-3 rounded-lg border bg-card/50 p-3"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border font-bold ${getMedalColor(entry.position)}`}
              >
                {entry.position}
              </div>
              <div className="flex-1">
                <p className="font-medium">{entry.influencerName}</p>
                {entry.instagram && (
                  <p className="text-sm text-muted-foreground">{entry.instagram}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{entry.totalScore}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
