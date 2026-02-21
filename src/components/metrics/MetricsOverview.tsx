import { Users, FileCheck, Target, ShoppingCart, BarChart3 } from 'lucide-react';
import type { ContentRow, EvalRow } from '@/hooks/useMetricsAnalysis';

interface Props {
  contents: ContentRow[];
  evaluations: EvalRow[];
  activeInfluencerCount: number;
}

export function MetricsOverview({ contents, evaluations, activeInfluencerCount }: Props) {
  const totalContents = contents.length;
  const feedCount = contents.filter((c) => c.type === 'feed').length;
  const storyCount = contents.filter((c) => c.type === 'story').length;
  const totalLeads = evaluations.reduce((s, e) => s + e.leads, 0);
  const totalSales = evaluations.reduce((s, e) => s + e.sales, 0);

  const cards = [
    { title: 'Influenciadores Ativos', value: activeInfluencerCount, icon: Users },
    { title: 'Conteúdos Postados', value: totalContents, icon: FileCheck, sub: `Feed: ${feedCount} · Stories: ${storyCount}` },
    { title: 'Total de Leads', value: totalLeads, icon: Target },
    { title: 'Total de Vendas', value: totalSales, icon: ShoppingCart },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.title} className="stat-card flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <c.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{c.title}</p>
            <p className="text-2xl font-bold">{c.value}</p>
            {c.sub && <p className="text-xs text-muted-foreground">{c.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
