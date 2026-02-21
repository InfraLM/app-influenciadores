import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ContentRow } from '@/hooks/useMetricsAnalysis';

interface Props {
  contents: ContentRow[];
  activeInfluencerCount: number;
}

export function ContentMetricsSection({ contents, activeInfluencerCount }: Props) {
  const totalContents = contents.length;
  const avgPerInfluencer = activeInfluencerCount > 0 ? (totalContents / activeInfluencerCount).toFixed(1) : '0';
  const feedCount = contents.filter((c) => c.type === 'feed').length;
  const storyCount = contents.filter((c) => c.type === 'story').length;

  const avgReach = totalContents > 0 ? Math.round(contents.reduce((s, c) => s + c.reach, 0) / totalContents) : 0;
  const avgInteractions = totalContents > 0 ? Math.round(contents.reduce((s, c) => s + c.interactions, 0) / totalContents) : 0;

  // Group by month for trend
  const monthlyTrend = useMemo(() => {
    const map = new Map<string, { month: string; reach: number; interactions: number; count: number }>();
    contents.forEach((c) => {
      const existing = map.get(c.month_year) || { month: c.month_year, reach: 0, interactions: 0, count: 0 };
      existing.reach += c.reach;
      existing.interactions += c.interactions;
      existing.count += 1;
      map.set(c.month_year, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        month: formatMonth(m.month),
        'Alcance Médio': m.count > 0 ? Math.round(m.reach / m.count) : 0,
        'Interações Médias': m.count > 0 ? Math.round(m.interactions / m.count) : 0,
        Conteúdos: m.count,
      }));
  }, [contents]);

  // Type distribution chart
  const typeData = [
    { name: 'Feed', value: feedCount },
    { name: 'Stories', value: storyCount },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Métricas de Conteúdo</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniCard label="Total de Conteúdos" value={totalContents} />
        <MiniCard label="Média por Influenciador" value={avgPerInfluencer} />
        <MiniCard label="Alcance Médio / Post" value={avgReach.toLocaleString('pt-BR')} />
        <MiniCard label="Interações Médias / Post" value={avgInteractions.toLocaleString('pt-BR')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="stat-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Distribuição por Tipo</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Conteúdos por Mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="Conteúdos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Evolução de Alcance e Engajamento</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Line type="monotone" dataKey="Alcance Médio" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Interações Médias" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function formatMonth(my: string) {
  const [y, m] = my.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(m) - 1]}/${y.slice(2)}`;
}
