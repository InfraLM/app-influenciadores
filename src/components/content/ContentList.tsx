import { useState } from 'react';
import { Edit, Trash2, Image, MoreHorizontal, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLinkButton } from './ExternalLinkButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ContentRecord, useDeleteContent } from '@/hooks/useContents';
import { sendContentWebhook } from '@/services/webhookService';
import { ContentDetailsView } from './ContentDetailsView';

interface ContentListProps {
  contents: ContentRecord[];
  onEdit?: (content: ContentRecord) => void;
  canEdit: boolean;
  showInfluencerName?: boolean;
}

export function ContentList({ contents, onEdit, canEdit, showInfluencerName = false }: ContentListProps) {
  const { profile } = useAuth();
  const [deleteContent, setDeleteContent] = useState<ContentRecord | null>(null);
  const [viewingContent, setViewingContent] = useState<ContentRecord | null>(null);
  const deleteContentMutation = useDeleteContent();

  const handleDelete = async () => {
    if (!deleteContent) return;

    try {
      await deleteContentMutation.mutateAsync(deleteContent.id);
      
      await sendContentWebhook('delete', {
        id: deleteContent.id,
        influencerId: deleteContent.influencer_id,
        monthYear: deleteContent.month_year,
        type: deleteContent.type,
        postDate: deleteContent.post_date,
        product: deleteContent.product,
        reach: deleteContent.reach,
        interactions: deleteContent.interactions,
        notes: deleteContent.notes || undefined,
        contentLink: deleteContent.content_link || undefined,
        proofUrl: deleteContent.proof_url || undefined,
        isExtra: deleteContent.is_extra,
        createdAt: deleteContent.created_at,
        updatedAt: deleteContent.updated_at,
      }, profile);
      
      toast.success('Conteúdo excluído com sucesso!');
      setDeleteContent(null);
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Erro ao excluir conteúdo');
    }
  };

  const getInfluencerName = (content: ContentRecord) => {
    return content.influencer?.full_name || 'Desconhecido';
  };

  if (contents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Image className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Nenhum conteúdo registrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {contents.map((content) => (
          <div
            key={content.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
          >
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={content.type === 'feed' ? 'default' : 'secondary'}>
                  {content.type === 'feed' ? 'Feed' : 'Story'}
                </Badge>
                {content.is_extra && (
                  <Badge variant="outline" className="text-primary border-primary">
                    Extra
                  </Badge>
                )}
                {showInfluencerName && (
                  <span className="text-sm font-medium text-muted-foreground">
                    • {getInfluencerName(content)}
                  </span>
                )}
              </div>
              
              <p className="font-medium">{content.product}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>
                  📅 {new Date(content.post_date).toLocaleDateString('pt-BR')}
                </span>
                <span>👁️ {content.reach.toLocaleString('pt-BR')} alcance</span>
                <span>💬 {content.interactions.toLocaleString('pt-BR')} interações</span>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                {content.content_link && (
                  <ExternalLinkButton url={content.content_link} label="Ver post" showCopyButton />
                )}
                {content.proof_url && (
                  <ExternalLinkButton url={content.proof_url} label="Ver comprovação" showCopyButton />
                )}
              </div>

              {content.notes && (
                <p className="text-sm text-muted-foreground italic">
                  "{content.notes}"
                </p>
              )}
            </div>

            {/* Actions dropdown - always show for view details, edit/delete only for canEdit */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewingContent(content)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalhes
                </DropdownMenuItem>
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(content)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteContent(content)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* View Details Dialog */}
      <ContentDetailsView
        content={viewingContent}
        open={!!viewingContent}
        onClose={() => setViewingContent(null)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteContent} onOpenChange={() => setDeleteContent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conteúdo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro do conteúdo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
