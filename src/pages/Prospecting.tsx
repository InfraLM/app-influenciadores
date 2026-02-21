import { useState, useCallback, useMemo } from 'react';
import { Download, ChevronDown, ChevronUp, Loader2, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/prospecting/KanbanBoard';
import { CreateProspectDialog } from '@/components/prospecting/CreateProspectDialog';
import { ProspectDetailDialog } from '@/components/prospecting/ProspectDetailDialog';
import { ProspectMetrics } from '@/components/prospecting/ProspectMetrics';
import { ProspectFilterPanel } from '@/components/prospecting/ProspectFilterPanel';
import { useProspectCards } from '@/hooks/useProspects';
import { exportProspectsCSV } from '@/lib/exportCsv';
import { exportProspectsPdf } from '@/lib/exportProspectsPdf';
import type { ProspectCard, ProspectFilters } from '@/types/prospect';
import { EMPTY_FILTERS, applyFilters } from '@/types/prospect';

export default function Prospecting() {
  const [showMetrics, setShowMetrics] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<ProspectFilters>(EMPTY_FILTERS);
  const [selectedCard, setSelectedCard] = useState<ProspectCard | null>(null);

  const { data: cards = [], isLoading } = useProspectCards();

  const filteredCards = useMemo(() => applyFilters(cards, filters), [cards, filters]);

  const handleCardClick = useCallback((card: ProspectCard) => {
    setSelectedCard(card);
  }, []);

  const freshSelectedCard = useMemo(() => {
    if (!selectedCard) return null;
    return cards.find((c) => c.id === selectedCard.id) || selectedCard;
  }, [selectedCard, cards]);

  const handleExport = () => exportProspectsCSV(filteredCards);
  const handleExportPdf = () => exportProspectsPdf(filteredCards);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Prospecção</h1>
          <p className="page-description">Pipeline de prospecção de influenciadores</p>
        </div>

        <div className="flex items-center gap-2">
          <CreateProspectDialog />
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={filteredCards.length === 0}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredCards.length === 0}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMetrics((s) => !s)}
          >
            {showMetrics ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            Métricas
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ProspectFilterPanel filters={filters} onChange={setFilters} />
      )}

      {/* Metrics (collapsible) */}
      {showMetrics && (
        <div className="stat-card animate-fade-in">
          <ProspectMetrics cards={filteredCards} />
        </div>
      )}

      {/* Kanban */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <KanbanBoard cards={filteredCards} onCardClick={handleCardClick} />
      )}

      {/* Detail Dialog */}
      <ProspectDetailDialog
        card={freshSelectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => { if (!open) setSelectedCard(null); }}
      />
    </div>
  );
}
