import { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Clock, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProspectCard, RejectionReason } from '@/types/prospect';
import { STATUS_LABELS, REJECTION_REASON_LABELS } from '@/types/prospect';

interface Props {
  cards: ProspectCard[];
}

type PeriodFilter = '7' | '30' | '90' | 'all';

function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
}

export function ProspectMetrics({ cards }: Props) {
  const [period, setPeriod] = useState<PeriodFilter>('all');

  const filtered = useMemo(() => {
    if (period === 'all') return cards;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(period));
    return cards.filter((c) => new Date(c.created_at) >= cutoff);
  }, [cards, period]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((c) => c.status !== 'nao_prosseguir').length;
    const rejected = filtered.filter((c) => c.status === 'nao_prosseguir').length;
    const approved = filtered.filter((c) => c.status === 'aprovada_confirmada').length;
    const conversionRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0';

    // Count per status
    const byStatus: Record<string, number> = {};
    filtered.forEach((c) => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });

    // Average time to close
    const closedCards = filtered.filter((c) => c.date_first_contact && c.date_closed);
    const avgCloseTime = closedCards.length > 0
      ? (closedCards.reduce((sum, c) => sum + (daysBetween(c.date_first_contact, c.date_closed) || 0), 0) / closedCards.length).toFixed(1)
      : null;

    // Average time awaiting response
    const awaitingCards = filtered.filter((c) =>
      c.date_awaiting_response && (c.date_closed || c.date_last_contact),
    );
    const avgAwaitTime = awaitingCards.length > 0
      ? (awaitingCards.reduce((sum, c) => {
          const end = c.date_closed || c.date_last_contact;
          return sum + (daysBetween(c.date_awaiting_response, end) || 0);
        }, 0) / awaitingCards.length).toFixed(1)
      : null;

    // Rejection reasons ranking
    const reasonCounts: Record<string, number> = {};
    filtered
      .filter((c) => c.rejection_reason)
      .forEach((c) => {
        const r = c.rejection_reason!;
        reasonCounts[r] = (reasonCounts[r] || 0) + 1;
      });
    const topReasons = Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { total, active, rejected, approved, conversionRate, byStatus, avgCloseTime, avgAwaitTime, topReasons };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Métricas do Pipeline
        </h3>
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total de cards" value={stats.total} />
        <MetricCard label="Ativos" value={stats.active} sub={`${stats.rejected} arquivados`} />
        <MetricCard label="Aprovados" value={stats.approved} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
        <MetricCard label="Taxa de conversão" value={`${stats.conversionRate}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Time metrics */}
        <div className="rounded-lg border bg-card/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Tempo médio até fechamento</span>
          </div>
          <p className="text-lg font-bold">{stats.avgCloseTime ? `${stats.avgCloseTime} dias` : '—'}</p>
        </div>

        <div className="rounded-lg border bg-card/50 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Tempo médio aguardando retorno</span>
          </div>
          <p className="text-lg font-bold">{stats.avgAwaitTime ? `${stats.avgAwaitTime} dias` : '—'}</p>
        </div>

        {/* Rejection reasons */}
        <div className="rounded-lg border bg-card/50 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Motivos de rejeição</span>
          </div>
          {stats.topReasons.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum</p>
          ) : (
            <div className="space-y-1">
              {stats.topReasons.map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between text-xs">
                  <span className="truncate">
                    {REJECTION_REASON_LABELS[reason as RejectionReason] || reason}
                  </span>
                  <span className="font-medium ml-2">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Per-column breakdown */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <div key={status} className="rounded-md bg-muted/50 px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">{STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}:</span>{' '}
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-bold mt-1">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
