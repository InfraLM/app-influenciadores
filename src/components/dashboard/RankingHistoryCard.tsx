import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/supabase/client';

interface RankingHistoryCardProps {
  influencerId: string;
}

export function RankingHistoryCard({ influencerId }: RankingHistoryCardProps) {
  // Get last 6 months
  const currentDate = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  // Fetch evaluations for this influencer across the last 6 months
  const { data: evaluations = [] } = useQuery({
    queryKey: ['ranking-history', influencerId, months],
    queryFn: async () => {
      if (!influencerId) return [];
      
      const { data, error } = await api
        .from('performance_evaluations')
        .select('month_year, total_score')
        .eq('influencer_id', influencerId)
        .in('month_year', months);

      if (error) {
        console.error('Error fetching ranking history:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!influencerId,
  });

  // Build history
  const history = months.map((monthYear) => {
    const evaluation = evaluations.find((e) => e.month_year === monthYear);

    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    return {
      monthYear,
      monthName,
      position: null as number | null, // Position calculation would need all influencers
      score: evaluation ? Number(evaluation.total_score) : null,
      hasData: !!evaluation,
    };
  });

  // Calculate trend
  const getTrendIcon = (currentScore: number | null, previousScore: number | null) => {
    if (currentScore === null || previousScore === null) return null;
    if (currentScore > previousScore) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    }
    if (currentScore < previousScore) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const hasAnyData = history.some((h) => h.hasData);

  return (
    <div className="stat-card">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Histórico de Pontuação</h3>
      </div>

      {hasAnyData ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
            <span>Mês</span>
            <span className="text-right">Pontuação</span>
          </div>

          {history.map((entry, index) => (
            <div
              key={entry.monthYear}
              className="grid grid-cols-2 gap-4 text-sm py-2 border-b border-dashed last:border-0"
            >
              <span className="capitalize">{entry.monthName}</span>
              <div className="flex items-center justify-end gap-1">
                {entry.hasData ? (
                  <>
                    <span className="font-medium">{entry.score} pts</span>
                    {getTrendIcon(entry.score, history[index + 1]?.score || null)}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">
          Nenhum histórico disponível ainda
        </p>
      )}
    </div>
  );
}
