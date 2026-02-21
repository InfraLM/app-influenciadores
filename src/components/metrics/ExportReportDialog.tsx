import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ContentRow, EvalRow, InfluencerRow } from '@/hooks/useMetricsAnalysis';

interface Props {
  contents: ContentRow[];
  evaluations: EvalRow[];
  influencers: InfluencerRow[];
  periodLabel: string;
  productLabel: string;
  influencerLabel: string;
  disabled?: boolean;
}

export function ExportReportDialog({
  contents, evaluations, influencers,
  periodLabel, productLabel, influencerLabel,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const handlePdf = async () => {
    setExporting('pdf');
    try {
      const { exportMetricsPdf } = await import('@/lib/exportMetricsPdf');
      exportMetricsPdf({ contents, evaluations, influencers, periodLabel, productLabel, influencerLabel });
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  const handleExcel = async () => {
    setExporting('excel');
    try {
      const { exportMetricsExcel } = await import('@/lib/exportMetricsExcel');
      exportMetricsExcel({ contents, evaluations, influencers });
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="mr-2 h-4 w-4" /> Exportar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Relatório de Métricas</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          Selecione o formato desejado. Os filtros ativos serão aplicados aos dados exportados.
        </p>

        <div className="space-y-3">
          <button
            onClick={handlePdf}
            disabled={!!exporting}
            className="w-full flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <FileText className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {exporting === 'pdf' ? 'Gerando PDF…' : 'Exportar PDF'}
              </p>
              <p className="text-xs text-muted-foreground">
                Relatório visual com layout institucional, resumo executivo e tabela de performance. Ideal para apresentações e reuniões.
              </p>
            </div>
          </button>

          <button
            onClick={handleExcel}
            disabled={!!exporting}
            className="w-full flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {exporting === 'excel' ? 'Gerando planilha…' : 'Exportar Planilha (Excel)'}
              </p>
              <p className="text-xs text-muted-foreground">
                Arquivo .xlsx com 3 abas: Resumo Geral, Conteúdos e Ranking & Performance. Pronto para filtrar, ordenar e gerar gráficos.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-2 rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Filtros ativos:</strong> {periodLabel} · {productLabel} · {influencerLabel}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
