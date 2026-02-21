import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ContentRow, EvalRow, InfluencerRow } from '@/hooks/useMetricsAnalysis';

interface Props {
  influencer: InfluencerRow;
  contents: ContentRow[];
  evaluations: EvalRow[];
}

export function IndividualProfileSection({ influencer, contents, evaluations }: Props) {
  const infContents = contents.filter((c) => c.influencer_id === influencer.id);
  const infEvals = evaluations.filter((e) => e.influencer_id === influencer.id);

  const totalContents = infContents.length;
  const feedCount = infContents.filter((c) => c.type === 'feed').length;
  const storyCount = infContents.filter((c) => c.type === 'story').length;
  const avgReach = totalContents > 0 ? Math.round(infContents.reduce((s, c) => s + c.reach, 0) / totalContents) : 0;
  const avgInteractions = totalContents > 0 ? Math.round(infContents.reduce((s, c) => s + c.interactions, 0) / totalContents) : 0;
  const totalLeads = infEvals.reduce((s, e) => s + e.leads, 0);
  const totalSales = infEvals.reduce((s, e) => s + e.sales, 0);

  // Monthly evolution
  const monthlyData = useMemo(() => {
    const months = new Set<string>();
    infContents.forEach((c) => months.add(c.month_year));
    infEvals.forEach((e) => months.add(e.month_year));

    return Array.from(months)
      .sort()
      .map((my) => {
        const mc = infContents.filter((c) => c.month_year === my);
        const me = infEvals.find((e) => e.month_year === my);
        return {
          month: formatMonth(my),
          Conteúdos: mc.length,
          'Alcance Médio': mc.length > 0 ? Math.round(mc.reduce((s, c) => s + c.reach, 0) / mc.length) : 0,
          Pontuação: Number(me?.total_score || 0),
          Leads: me?.leads || 0,
          Vendas: me?.sales || 0,
        };
      });
  }, [infContents, infEvals]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {influencer.profile_photo_url ? (
          <img src={influencer.profile_photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {influencer.full_name.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold">{influencer.full_name}</h2>
          {influencer.instagram && <p className="text-sm text-muted-foreground">{influencer.instagram}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MiniCard label="Conteúdos" value={totalContents} />
        <MiniCard label="Feed" value={feedCount} />
        <MiniCard label="Stories" value={storyCount} />
        <MiniCard label="Alcance Médio" value={avgReach.toLocaleString('pt-BR')} />
        <MiniCard label="Leads" value={totalLeads} />
        <MiniCard label="Vendas" value={totalSales} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="stat-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Bar dataKey="Conteúdos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Leads" fill="hsl(210 80% 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Vendas" fill="hsl(150 60% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Histórico de Pontuação</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Line type="monotone" dataKey="Pontuação" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Alcance Médio" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
