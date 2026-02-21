import { Calendar, MessageSquare, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ContentRecord } from '@/hooks/useContents';
import { ExternalLinkButton } from './ExternalLinkButton';

interface ContentDetailsViewProps {
  content: ContentRecord | null;
  open: boolean;
  onClose: () => void;
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-0.5">{value || '-'}</div>
      </div>
    </div>
  );
}

export function ContentDetailsView({ content, open, onClose }: ContentDetailsViewProps) {
  if (!content) return null;

  const influencerName = content.influencer?.full_name || 'Desconhecido';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Conteúdo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={content.type === 'feed' ? 'default' : 'secondary'}>
              {content.type === 'feed' ? 'Feed' : 'Story'}
            </Badge>
            {content.is_extra && (
              <Badge variant="outline" className="text-primary border-primary">
                Extra
              </Badge>
            )}
          </div>

          {/* Influencer */}
          <DetailRow label="Influenciador" value={influencerName} />

          <Separator />

          {/* Content info */}
          <div className="grid gap-1">
            <DetailRow
              label="Curso/Produto"
              value={content.product}
              icon={Package}
            />
            <DetailRow
              label="Data da Postagem"
              value={new Date(content.post_date).toLocaleDateString('pt-BR')}
              icon={Calendar}
            />
            <DetailRow
              label="Mês de Referência"
              value={(() => {
                const [year, month] = content.month_year.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
              })()}
            />
          </div>

          <Separator />

          {/* Metrics */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Métricas</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Alcance</p>
                <p className="text-lg font-bold text-primary">
                  {content.reach.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Interações</p>
                <p className="text-lg font-bold text-primary">
                  {content.interactions.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Links & Proofs */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Links e Comprovações</p>
            <div className="grid gap-2">
              {/* Content Link */}
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">Link do Conteúdo</p>
                <ExternalLinkButton url={content.content_link} showCopyButton />
              </div>

              {/* Proof URL */}
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">Comprovação (Print/Screenshot)</p>
                <ExternalLinkButton url={content.proof_url} label="Ver comprovação" showCopyButton />
              </div>
            </div>

            
          </div>

          {/* Notes */}
          {content.notes && (
            <>
              <Separator />
              <DetailRow
                label="Observações"
                value={
                  <p className="text-sm italic text-muted-foreground whitespace-pre-wrap">
                    "{content.notes}"
                  </p>
                }
                icon={MessageSquare}
              />
            </>
          )}

          <Separator />

          {/* System dates */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <span>Criado em: </span>
              <span className="font-medium">
                {new Date(content.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div>
              <span>Atualizado em: </span>
              <span className="font-medium">
                {new Date(content.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
