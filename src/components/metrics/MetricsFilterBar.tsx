import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import type { InfluencerRow } from '@/hooks/useMetricsAnalysis';

const PRODUCTS = [
  { value: 'all', label: 'Todos os Produtos' },
  { value: 'Formação em Paciente Grave Online', label: 'FPG Online' },
  { value: 'Formação em Paciente Grave Presencial', label: 'FPG Presencial' },
  { value: 'Pós-Graduação em Paciente Grave', label: 'Pós-Graduação' },
];

interface Props {
  selectedMonth: string;
  onMonthChange: (v: string) => void;
  monthOptions: { value: string; label: string }[];
  rangeMonths: number;
  onRangeChange: (v: number) => void;
  product: string;
  onProductChange: (v: string) => void;
  influencerId: string;
  onInfluencerChange: (v: string) => void;
  influencers: InfluencerRow[];
}

export function MetricsFilterBar({
  selectedMonth, onMonthChange, monthOptions,
  rangeMonths, onRangeChange,
  product, onProductChange,
  influencerId, onInfluencerChange,
  influencers,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
      <Filter className="h-4 w-4 text-muted-foreground" />

      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mês base" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(rangeMonths)} onValueChange={(v) => onRangeChange(Number(v))}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 mês</SelectItem>
          <SelectItem value="3">3 meses</SelectItem>
          <SelectItem value="6">6 meses</SelectItem>
          <SelectItem value="12">12 meses</SelectItem>
        </SelectContent>
      </Select>

      <Select value={product} onValueChange={onProductChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRODUCTS.map((p) => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={influencerId} onValueChange={onInfluencerChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos os influenciadores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Influenciadores</SelectItem>
          {influencers.map((inf) => (
            <SelectItem key={inf.id} value={inf.id}>{inf.full_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(product !== 'all' || influencerId !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onProductChange('all');
            onInfluencerChange('all');
          }}
        >
          <X className="mr-1 h-3 w-3" /> Limpar filtros
        </Button>
      )}
    </div>
  );
}
