import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { ContentRow, EvalRow, InfluencerRow } from '@/hooks/useMetricsAnalysis';

interface Props {
  contents: ContentRow[];
  evaluations: EvalRow[];
  influencers: InfluencerRow[];
}

type SortKey = 'name' | 'contents' | 'reach' | 'interactions' | 'engagementRate' | 'leads' | 'sales' | 'score';

export function InfluencerComparisonTable({ contents, evaluations, influencers }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('contents');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    return influencers.map((inf) => {
      const ic = contents.filter((c) => c.influencer_id === inf.id);
      const ie = evaluations.filter((e) => e.influencer_id === inf.id);
      const totalReach = ic.reduce((s, c) => s + c.reach, 0);
      const totalInteractions = ic.reduce((s, c) => s + c.interactions, 0);
      const engagementRate = totalReach > 0 ? (totalInteractions / totalReach) * 100 : 0;
      const totalLeads = ie.reduce((s, e) => s + e.leads, 0);
      const totalSales = ie.reduce((s, e) => s + e.sales, 0);
      const avgScore = ie.length > 0
        ? ie.reduce((s, e) => s + (e.total_score ?? 0), 0) / ie.length
        : 0;

      return {
        id: inf.id,
        name: inf.full_name,
        instagram: inf.instagram,
        contents: ic.length,
        reach: totalReach,
        avgReach: ic.length > 0 ? Math.round(totalReach / ic.length) : 0,
        interactions: totalInteractions,
        avgInteractions: ic.length > 0 ? Math.round(totalInteractions / ic.length) : 0,
        engagementRate,
        leads: totalLeads,
        sales: totalSales,
        score: avgScore,
      };
    });
  }, [contents, evaluations, influencers]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return copy;
  }, [rows, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR');

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <Button variant="ghost" size="sm" className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground" onClick={() => toggleSort(k)}>
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Visão Geral Comparativa</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortHeader label="Influenciador" k="name" /></TableHead>
              <TableHead className="text-right"><SortHeader label="Conteúdos" k="contents" /></TableHead>
              <TableHead className="text-right"><SortHeader label="Alcance Total" k="reach" /></TableHead>
              <TableHead className="text-right">Alcance Médio</TableHead>
              <TableHead className="text-right"><SortHeader label="Interações" k="interactions" /></TableHead>
              <TableHead className="text-right">Inter. Média</TableHead>
              <TableHead className="text-right"><SortHeader label="Engaj. %" k="engagementRate" /></TableHead>
              <TableHead className="text-right"><SortHeader label="Leads" k="leads" /></TableHead>
              <TableHead className="text-right"><SortHeader label="Vendas" k="sales" /></TableHead>
              <TableHead className="text-right"><SortHeader label="Pont. Média" k="score" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  Nenhum influenciador encontrado para o período selecionado.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      {r.instagram && <p className="text-xs text-muted-foreground">@{r.instagram}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{r.contents}</TableCell>
                  <TableCell className="text-right">{fmt(r.reach)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt(r.avgReach)}</TableCell>
                  <TableCell className="text-right">{fmt(r.interactions)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmt(r.avgInteractions)}</TableCell>
                  <TableCell className="text-right">{r.engagementRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{r.leads}</TableCell>
                  <TableCell className="text-right">{r.sales}</TableCell>
                  <TableCell className="text-right font-medium">{r.score.toFixed(1)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
