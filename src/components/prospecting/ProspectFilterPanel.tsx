import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProspectFilters, PipelineType } from '@/types/prospect';
import { PIPELINE_LABELS, BRAZILIAN_STATES, SIZE_CATEGORIES, EMPTY_FILTERS } from '@/types/prospect';

interface Props {
  filters: ProspectFilters;
  onChange: (filters: ProspectFilters) => void;
}

export function ProspectFilterPanel({ filters, onChange }: Props) {
  const toggleProduct = (pt: PipelineType) => {
    const current = filters.productTracks;
    const next = current.includes(pt)
      ? current.filter((p) => p !== pt)
      : [...current, pt];
    onChange({ ...filters, productTracks: next });
  };

  const hasFilters =
    filters.search ||
    filters.productTracks.length > 0 ||
    filters.stateUf ||
    filters.sizeCategory ||
    filters.minFollowers != null ||
    filters.maxFollowers != null;

  return (
    <div className="rounded-lg border bg-card/50 p-3 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Buscar por nome ou @Instagram..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Product toggles */}
        <div className="flex gap-1.5">
          {(Object.keys(PIPELINE_LABELS) as PipelineType[]).map((pt) => (
            <Badge
              key={pt}
              variant={filters.productTracks.includes(pt) ? 'default' : 'outline'}
              className="cursor-pointer text-xs select-none"
              onClick={() => toggleProduct(pt)}
            >
              {PIPELINE_LABELS[pt]}
            </Badge>
          ))}
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)} className="text-xs">
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Size Category */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Categoria:</span>
          <Select value={filters.sizeCategory || '_all'} onValueChange={(v) => onChange({ ...filters, sizeCategory: v === '_all' ? '' : v })}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todas</SelectItem>
              {SIZE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* UF */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">UF:</span>
          <Select value={filters.stateUf || '_all'} onValueChange={(v) => onChange({ ...filters, stateUf: v === '_all' ? '' : v })}>
            <SelectTrigger className="h-8 w-[80px] text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos</SelectItem>
              {BRAZILIAN_STATES.map((uf) => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Followers range */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Seguidores:</span>
          <Input
            type="number"
            placeholder="Mín"
            value={filters.minFollowers ?? ''}
            onChange={(e) => onChange({ ...filters, minFollowers: e.target.value ? Number(e.target.value) : null })}
            className="h-8 w-[90px] text-xs"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Máx"
            value={filters.maxFollowers ?? ''}
            onChange={(e) => onChange({ ...filters, maxFollowers: e.target.value ? Number(e.target.value) : null })}
            className="h-8 w-[90px] text-xs"
          />
        </div>
      </div>
    </div>
  );
}
