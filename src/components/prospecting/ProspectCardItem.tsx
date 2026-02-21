import { Draggable } from '@hello-pangea/dnd';
import { ExternalLink, MapPin, Users } from 'lucide-react';
import type { ProspectCard } from '@/types/prospect';
import { normalizeUrl, extractInstagramHandle, PIPELINE_LABELS } from '@/types/prospect';
import { Badge } from '@/components/ui/badge';

interface ProspectCardItemProps {
  card: ProspectCard;
  index: number;
  onClick: () => void;
}

function formatFollowers(n: number | null): string {
  if (n == null) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ProspectCardItem({ card, index, onClick }: ProspectCardItemProps) {
  const handle = extractInstagramHandle(card.instagram_url);

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`cursor-pointer rounded-md border bg-card p-3 transition-shadow hover:border-primary/40 ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/30' : 'shadow-sm'
          }`}
        >
          <p className="font-medium text-sm truncate">{card.name}</p>

          <a
            href={normalizeUrl(card.instagram_url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline truncate"
          >
            @{handle}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>

          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {PIPELINE_LABELS[card.pipeline_type]}
            </Badge>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {card.size_category}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {card.niche}
            </Badge>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            {card.state_uf && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {card.state_uf}
              </span>
            )}
            {card.followers != null && (
              <span className="flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                {formatFollowers(card.followers)}
              </span>
            )}
          </div>

          {card.converted_influencer_id && (
            <Badge className="mt-2 text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Convertido
            </Badge>
          )}
        </div>
      )}
    </Draggable>
  );
}
