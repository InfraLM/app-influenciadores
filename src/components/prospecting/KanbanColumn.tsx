import { Droppable } from '@hello-pangea/dnd';
import { ProspectCardItem } from './ProspectCardItem';
import type { ProspectCard, ProspectStatus } from '@/types/prospect';
import { STATUS_LABELS, COLUMN_COLORS } from '@/types/prospect';

interface KanbanColumnProps {
  status: ProspectStatus;
  cards: ProspectCard[];
  onCardClick: (card: ProspectCard) => void;
}

export function KanbanColumn({ status, cards, onCardClick }: KanbanColumnProps) {
  return (
    <div className={`flex min-w-[260px] max-w-[300px] flex-col rounded-lg border border-border bg-card/50 border-t-4 ${COLUMN_COLORS[status]}`}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground truncate">
          {STATUS_LABELS[status]}
        </h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          {cards.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-accent/30' : ''
            }`}
          >
            {cards.map((card, index) => (
              <ProspectCardItem
                key={card.id}
                card={card}
                index={index}
                onClick={() => onCardClick(card)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
