import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import type { ContentRow, EvalRow } from '@/hooks/useMetricsAnalysis';

interface Props {
  contents: ContentRow[];
  evaluations: EvalRow[];
}

export function RankingCorrelationSection({ contents, evaluations }: Props) {
  const avgScore = evaluations.length > 0
    ? (evaluations.reduce((s, e) => s + (e.total_score || 0), 0) / evaluations.length).toFixed(1)
    : '0';

  // Correlation: contents x score per influencer
  const correlationData = useMemo(() => {
    const contentCount = new Map<string, number>();
    contents.forEach((c) => contentCount.set(c.influencer_id, (contentCount.get(c.influencer_id) || 0) + 1));

    const seen = new Set<string>();
    return evaluations
      .filter((e) => {
        if (seen.has(e.influencer_id)) return false;
        seen.add(e.influencer_id);
        return true;
      })
      .map((e) => ({
        name: e.influencer?.full_name || 'N/A',
        Conteúdos: contentCount.get(e.influencer_id) || 0,
        Pontuação: Number(e.total_score || 0),
      }));
  }, [contents, evaluations]);

  // Score evolution by month
  const scoreEvolution = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    evaluations.forEach((e) => {
      const existing = map.get(e.month_year) || { total: 0, count: 0 };
      existing.total += Number(e.total_score || 0);
      existing.count += 1;
      map.set(e.month_year, existing);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([my, v]) => ({
        month: formatMonth(my),
        'Pontuação Média': Number((v.total / v.count).toFixed(1)),
      }));
  }, [evaluations]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Ranking e Performance</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pontuação Média do Time</p>
          <p className="text-2xl font-bold">{avgScore} pts</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Avaliações no Período</p>
          <p className="text-2xl font-bold">{evaluations.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="stat-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Evolução da Pontuação Média</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={scoreEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Line type="monotone" dataKey="Pontuação Média" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Conteúdos × Pontuação (por Influenciador)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="Conteúdos" name="Conteúdos" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis dataKey="Pontuação" name="Pontuação" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={() => ''}
              />
              <Scatter data={correlationData} fill="hsl(var(--primary))" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function formatMonth(my: string) {
  const [y, m] = my.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(m) - 1]}/${y.slice(2)}`;
}
