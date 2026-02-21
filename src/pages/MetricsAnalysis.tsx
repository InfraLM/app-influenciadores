import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { MetricsFilterBar } from '@/components/metrics/MetricsFilterBar';
import { MetricsOverview } from '@/components/metrics/MetricsOverview';
import { ContentMetricsSection } from '@/components/metrics/ContentMetricsSection';
import { LeadsSalesSection } from '@/components/metrics/LeadsSalesSection';
import { RankingCorrelationSection } from '@/components/metrics/RankingCorrelationSection';
import { IndividualProfileSection } from '@/components/metrics/IndividualProfileSection';
import { InfluencerComparisonTable } from '@/components/metrics/InfluencerComparisonTable';
import { ExportReportDialog } from '@/components/metrics/ExportReportDialog';
import { useMetricsContents, useMetricsEvaluations, useActiveInfluencers } from '@/hooks/useMetricsAnalysis';

export default function MetricsAnalysis() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [rangeMonths, setRangeMonths] = useState(3);
  const [product, setProduct] = useState('all');
  const [influencerId, setInfluencerId] = useState('all');

  // Generate month range
  const monthYears = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const result: string[] = [];
    for (let i = 0; i < rangeMonths; i++) {
      const d = new Date(y, m - 1 - i, 1);
      result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return result;
  }, [selectedMonth, rangeMonths]);

  // Month options for selector
  const monthOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      };
    });
  }, []);

  const { data: allContents = [], isLoading: loadingC } = useMetricsContents(monthYears);
  const { data: allEvals = [], isLoading: loadingE } = useMetricsEvaluations(monthYears);
  const { data: influencers = [], isLoading: loadingI } = useActiveInfluencers();

  // Apply filters
  const contents = useMemo(() => {
    let filtered = allContents;
    if (product !== 'all') filtered = filtered.filter((c) => c.product === product);
    if (influencerId !== 'all') filtered = filtered.filter((c) => c.influencer_id === influencerId);
    return filtered;
  }, [allContents, product, influencerId]);

  const evaluations = useMemo(() => {
    let filtered = allEvals;
    if (influencerId !== 'all') filtered = filtered.filter((e) => e.influencer_id === influencerId);
    return filtered;
  }, [allEvals, influencerId]);

  const activeCount = influencerId !== 'all' ? 1 : influencers.length;
  const selectedInfluencer = influencerId !== 'all' ? influencers.find((i) => i.id === influencerId) : null;

  const isLoading = loadingC || loadingE || loadingI;

  // Labels for export
  const periodLabel = useMemo(() => {
    const opts = monthOptions.find((o) => o.value === selectedMonth);
    return `${opts?.label || selectedMonth} (${rangeMonths} ${rangeMonths === 1 ? 'mês' : 'meses'})`;
  }, [selectedMonth, rangeMonths, monthOptions]);

  const PRODUCTS_MAP: Record<string, string> = {
    all: 'Todos os Produtos',
    'Formação em Paciente Grave Online': 'FPG Online',
    'Formação em Paciente Grave Presencial': 'FPG Presencial',
    'Pós-Graduação em Paciente Grave': 'Pós-Graduação',
  };
  const productLabel = PRODUCTS_MAP[product] || product;
  const influencerLabel = influencerId !== 'all'
    ? influencers.find((i) => i.id === influencerId)?.full_name || 'Selecionado'
    : 'Todos os Influenciadores';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Análise de Métricas</h1>
          <p className="page-description">Painel analítico estratégico do time de influenciadores</p>
        </div>
        <ExportReportDialog
          contents={contents}
          evaluations={evaluations}
          influencers={influencers}
          periodLabel={periodLabel}
          productLabel={productLabel}
          influencerLabel={influencerLabel}
          disabled={isLoading}
        />
      </div>

      <MetricsFilterBar
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        monthOptions={monthOptions}
        rangeMonths={rangeMonths}
        onRangeChange={setRangeMonths}
        product={product}
        onProductChange={setProduct}
        influencerId={influencerId}
        onInfluencerChange={setInfluencerId}
        influencers={influencers}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <MetricsOverview contents={contents} evaluations={evaluations} activeInfluencerCount={activeCount} />
          <InfluencerComparisonTable contents={contents} evaluations={evaluations} influencers={influencers} />
          <ContentMetricsSection contents={contents} activeInfluencerCount={activeCount} />
          <LeadsSalesSection evaluations={evaluations} activeInfluencerCount={activeCount} />
          <RankingCorrelationSection contents={contents} evaluations={evaluations} />

          {selectedInfluencer && (
            <IndividualProfileSection
              influencer={selectedInfluencer}
              contents={allContents}
              evaluations={allEvals}
            />
          )}
        </>
      )}
    </div>
  );
}
