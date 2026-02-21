import { useMemo, useState, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import type { ProspectCard, ProspectStatus, RejectionReason } from '@/types/prospect';
import { COLUMNS_ORDER } from '@/types/prospect';
import { useMoveProspectCard, useAddReopenHistory, useConvertProspect } from '@/hooks/useProspects';
import { RejectionReasonDialog } from './RejectionReasonDialog';

interface KanbanBoardProps {
  cards: ProspectCard[];
  onCardClick: (card: ProspectCard) => void;
}

interface PendingMove {
  card: ProspectCard;
  newStatus: ProspectStatus;
}

export function KanbanBoard({ cards, onCardClick }: KanbanBoardProps) {
  const [pendingRejection, setPendingRejection] = useState<PendingMove | null>(null);

  const moveCard = useMoveProspectCard();
  const addReopen = useAddReopenHistory();
  const convertProspect = useConvertProspect();

  const cardsByStatus = useMemo(() => {
    const map: Record<ProspectStatus, ProspectCard[]> = {
      contato_inicial: [],
      em_negociacao: [],
      aguardando_retorno: [],
      aprovada_confirmada: [],
      nao_prosseguir: [],
    };
    cards.forEach((c) => {
      if (map[c.status]) map[c.status].push(c);
    });
    return map;
  }, [cards]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { draggableId, destination, source } = result;
      if (!destination || destination.droppableId === source.droppableId) return;

      const card = cards.find((c) => c.id === draggableId);
      if (!card) return;

      const newStatus = destination.droppableId as ProspectStatus;

      // If moving TO "nao_prosseguir", require reason
      if (newStatus === 'nao_prosseguir') {
        setPendingRejection({ card, newStatus });
        return;
      }

      // If moving FROM "nao_prosseguir", record reopen
      if (card.status === 'nao_prosseguir') {
        addReopen.mutate(card.id);
      }

      moveCard.mutate({ id: card.id, newStatus, currentCard: card });

      // Auto-convert when moving to "aprovada_confirmada"
      if (newStatus === 'aprovada_confirmada' && !card.converted_influencer_id) {
        convertProspect.mutate(card);
      }
    },
    [cards, moveCard, addReopen, convertProspect],
  );

  const handleRejectionConfirm = useCallback(
    (reason: RejectionReason, notes?: string) => {
      if (!pendingRejection) return;
      moveCard.mutate({
        id: pendingRejection.card.id,
        newStatus: 'nao_prosseguir',
        currentCard: pendingRejection.card,
        rejectionReason: reason,
        rejectionNotes: notes,
      });
      setPendingRejection(null);
    },
    [pendingRejection, moveCard],
  );

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              cards={cardsByStatus[status]}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </DragDropContext>

      <RejectionReasonDialog
        open={!!pendingRejection}
        onOpenChange={(open) => { if (!open) setPendingRejection(null); }}
        onConfirm={handleRejectionConfirm}
      />
    </>
  );
}
