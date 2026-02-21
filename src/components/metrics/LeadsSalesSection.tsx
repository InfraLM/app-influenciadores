import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EvalRow } from '@/hooks/useMetricsAnalysis';

interface Props {
  evaluations: EvalRow[];
  activeInfluencerCount: number;
}

export function LeadsSalesSection({ evaluations, activeInfluencerCount }: Props) {
  const totalLeads = evaluations.reduce((s, e) => s + e.leads, 0);
  const totalSales = evaluations.reduce((s, e) => s + e.sales, 0);
  const avgLeads = activeInfluencerCount > 0 ? (totalLeads / activeInfluencerCount).toFixed(1) : '0';
  const avgSales = activeInfluencerCount > 0 ? (totalSales / activeInfluencerCount).toFixed(1) : '0';

  const monthlyData = useMemo(() => {
    const map = new Map<string, { leads: number; sales: number }>();
    evaluations.forEach((e) => {
      const existing = map.get(e.month_year) || { leads: 0, sales: 0 };
      existing.leads += e.leads;
      existing.sales += e.sales;
      map.set(e.month_year, existing);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([my, v]) => ({
        month: formatMonth(my),
        Leads: v.leads,
        Vendas: v.sales,
      }));
  }, [evaluations]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Leads e Vendas</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniCard label="Total de Leads" value={totalLeads} />
        <MiniCard label="Total de Vendas" value={totalSales} />
        <MiniCard label="Média Leads / Influenciador" value={avgLeads} />
        <MiniCard label="Média Vendas / Influenciador" value={avgSales} />
      </div>

      <div className="stat-card">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Evolução de Leads e Vendas</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
            <Legend />
            <Bar dataKey="Leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Vendas" fill="hsl(210 80% 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
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
