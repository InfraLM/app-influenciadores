import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, Trash2, Send, RotateCcw, MapPin, MessageSquare, Users, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { ProspectCard, PipelineType } from '@/types/prospect';
import {
  STATUS_LABELS, REJECTION_REASON_LABELS, PIPELINE_LABELS, normalizeUrl,
  extractInstagramHandle, SIZE_CATEGORIES, BRAZILIAN_STATES,
} from '@/types/prospect';
import type { RejectionReason } from '@/types/prospect';
import {
  useProspectComments, useAddProspectComment,
  useReopenHistory, useUpdateProspectCard, useDeleteProspectCard,
} from '@/hooks/useProspects';
import { toast } from '@/hooks/use-toast';

interface Props {
  card: ProspectCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function formatDateShort(dateStr: string | null) {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
}

function formatFollowers(n: number | null): string {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR');
}

export function ProspectDetailDialog({ card, open, onOpenChange }: Props) {
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editNiche, setEditNiche] = useState('');
  const [editSizeCategory, setEditSizeCategory] = useState('');
  const [editPipelineType, setEditPipelineType] = useState<PipelineType | ''>('');
  const [editStateUf, setEditStateUf] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editFollowers, setEditFollowers] = useState('');

  // Date editing
  const [editingDates, setEditingDates] = useState(false);
  const [dates, setDates] = useState({
    date_first_contact: '',
    date_negotiation_start: '',
    date_awaiting_response: '',
    date_closed: '',
    date_last_contact: '',
  });

  const { data: comments = [] } = useProspectComments(card?.id ?? null);
  const { data: reopenHistory = [] } = useReopenHistory(card?.id ?? null);
  const addComment = useAddProspectComment();
  const updateCard = useUpdateProspectCard();
  const deleteCard = useDeleteProspectCard();

  // Populate edit fields when card changes or editing starts
  useEffect(() => {
    if (card && isEditing) {
      setEditName(card.name);
      setEditInstagram(card.instagram_url);
      setEditNiche(card.niche);
      setEditSizeCategory(card.size_category);
      setEditPipelineType(card.pipeline_type);
      setEditStateUf(card.state_uf || '');
      setEditCity(card.city || '');
      setEditWhatsapp(card.whatsapp || '');
      setEditFollowers(card.followers != null ? String(card.followers) : '');
    }
  }, [card, isEditing]);

  if (!card) return null;

  const handle = extractInstagramHandle(card.instagram_url);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }
    if (!editInstagram.trim()) {
      toast({ title: 'Link do Instagram é obrigatório', variant: 'destructive' });
      return;
    }
    if (!editNiche.trim()) {
      toast({ title: 'Nicho é obrigatório', variant: 'destructive' });
      return;
    }
    if (!editSizeCategory) {
      toast({ title: 'Categoria do perfil é obrigatória', variant: 'destructive' });
      return;
    }
    if (!editPipelineType) {
      toast({ title: 'Produto/Curso é obrigatório', variant: 'destructive' });
      return;
    }

    updateCard.mutate(
      {
        id: card.id,
        name: editName.trim(),
        instagram_url: normalizeUrl(editInstagram.trim()),
        niche: editNiche.trim(),
        size_category: editSizeCategory,
        pipeline_type: editPipelineType as PipelineType,
        state_uf: editStateUf || null,
        city: editCity.trim() || null,
        whatsapp: editWhatsapp.trim() || null,
        followers: editFollowers ? Number(editFollowers) : null,
      } as any,
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({ title: 'Card atualizado com sucesso' });
        },
      },
    );
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ cardId: card.id, content: commentText.trim() });
    setCommentText('');
  };

  const startEditDates = () => {
    setDates({
      date_first_contact: card.date_first_contact?.substring(0, 16) || '',
      date_negotiation_start: card.date_negotiation_start?.substring(0, 16) || '',
      date_awaiting_response: card.date_awaiting_response?.substring(0, 16) || '',
      date_closed: card.date_closed?.substring(0, 16) || '',
      date_last_contact: card.date_last_contact?.substring(0, 16) || '',
    });
    setEditingDates(true);
  };

  const saveDates = () => {
    updateCard.mutate({
      id: card.id,
      date_first_contact: dates.date_first_contact ? new Date(dates.date_first_contact).toISOString() : null,
      date_negotiation_start: dates.date_negotiation_start ? new Date(dates.date_negotiation_start).toISOString() : null,
      date_awaiting_response: dates.date_awaiting_response ? new Date(dates.date_awaiting_response).toISOString() : null,
      date_closed: dates.date_closed ? new Date(dates.date_closed).toISOString() : null,
      date_last_contact: dates.date_last_contact ? new Date(dates.date_last_contact).toISOString() : null,
    } as any);
    setEditingDates(false);
  };

  const handleDelete = () => {
    deleteCard.mutate(card.id, { onSuccess: () => onOpenChange(false) });
  };

  const whatsappLink = card.whatsapp
    ? `https://wa.me/${card.whatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setIsEditing(false); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {card.name}
                <Badge variant="outline" className="text-xs">{STATUS_LABELS[card.status]}</Badge>
              </DialogTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                </Button>
              )}
            </div>
            <DialogDescription>Detalhes do prospect no pipeline.</DialogDescription>
          </DialogHeader>
        </div>

        {isEditing ? (
          /* ─── EDIT MODE ─── */
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
              <div>
                <Label>Produto/Curso *</Label>
                <Select value={editPipelineType} onValueChange={(v) => setEditPipelineType(v as PipelineType)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PIPELINE_LABELS) as PipelineType[]).map((pt) => (
                      <SelectItem key={pt} value={pt}>{PIPELINE_LABELS[pt]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nome *</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label>Link do Instagram *</Label>
                <Input value={editInstagram} onChange={(e) => setEditInstagram(e.target.value)} />
              </div>
              <div>
                <Label>Categoria do Perfil *</Label>
                <Select value={editSizeCategory} onValueChange={setEditSizeCategory}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {SIZE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nicho *</Label>
                <Input value={editNiche} onChange={(e) => setEditNiche(e.target.value)} />
              </div>
              <div>
                <Label>Seguidores (opcional)</Label>
                <Input type="number" value={editFollowers} onChange={(e) => setEditFollowers(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>UF (opcional)</Label>
                  <Select value={editStateUf || '_none'} onValueChange={(v) => setEditStateUf(v === '_none' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum</SelectItem>
                      {BRAZILIAN_STATES.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade (opcional)</Label>
                  <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>WhatsApp (opcional)</Label>
                <Input value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} />
              </div>
            </div>

            {/* FIXED FOOTER - always visible */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background shrink-0">
              <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar</Button>
              <Button type="submit" disabled={updateCard.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {updateCard.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        ) : (
          /* ─── VIEW MODE ─── */
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
            {/* Product badge */}
            <Badge variant="default" className="w-fit">
              {PIPELINE_LABELS[card.pipeline_type]}
            </Badge>

            {/* Links */}
            <div className="flex flex-wrap gap-2">
              <a
                href={normalizeUrl(card.instagram_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20 transition-colors"
              >
                @{handle} <ExternalLink className="h-3 w-3" />
              </a>
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                >
                  WhatsApp <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Categoria:</span> {card.size_category}</div>
              <div><span className="text-muted-foreground">Nicho:</span> {card.niche}</div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Seguidores:</span> {formatFollowers(card.followers)}
              </div>
              {card.state_uf && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" /> {card.state_uf}
                  {card.city && ` — ${card.city}`}
                </div>
              )}
              {card.whatsapp && (
                <div><span className="text-muted-foreground">WhatsApp:</span> {card.whatsapp}</div>
              )}
            </div>

            {/* Rejection info */}
            {card.status === 'nao_prosseguir' && card.rejection_reason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">
                  Motivo: {REJECTION_REASON_LABELS[card.rejection_reason as RejectionReason] || card.rejection_reason}
                </p>
                {card.rejection_notes && (
                  <p className="mt-1 text-sm text-muted-foreground">{card.rejection_notes}</p>
                )}
              </div>
            )}

            {card.converted_influencer_id && (
              <Badge className="w-fit bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                ✓ Convertido em influenciador
              </Badge>
            )}

            <Separator />

            {/* Dates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Datas</h4>
                {!editingDates ? (
                  <Button variant="ghost" size="sm" onClick={startEditDates}>Editar</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingDates(false)}>Cancelar</Button>
                    <Button size="sm" onClick={saveDates} disabled={updateCard.isPending}>Salvar</Button>
                  </div>
                )}
              </div>

              {editingDates ? (
                <div className="grid grid-cols-1 gap-3 text-sm">
                  {[
                    ['date_first_contact', 'Primeiro contato'],
                    ['date_negotiation_start', 'Início negociação'],
                    ['date_awaiting_response', 'Aguardando retorno'],
                    ['date_closed', 'Fechamento'],
                    ['date_last_contact', 'Último contato'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Label className="w-40 text-xs">{label}</Label>
                      <Input
                        type="datetime-local"
                        value={dates[key as keyof typeof dates]}
                        onChange={(e) => setDates((d) => ({ ...d, [key]: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Primeiro contato:</span> <span>{formatDate(card.date_first_contact)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Início negociação:</span> <span>{formatDate(card.date_negotiation_start)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Aguardando retorno:</span> <span>{formatDate(card.date_awaiting_response)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fechamento:</span> <span>{formatDate(card.date_closed)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Último contato:</span> <span>{formatDate(card.date_last_contact)}</span></div>
                </div>
              )}
            </div>

            {/* Reopen History */}
            {reopenHistory.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <RotateCcw className="h-3.5 w-3.5" /> Reprospecções
                  </h4>
                  <div className="space-y-1">
                    {reopenHistory.map((r) => (
                      <p key={r.id} className="text-xs text-muted-foreground">
                        Reaberto em {formatDate(r.reopened_at)}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Comments */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Observações
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-3 mb-3">
                {comments.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma observação ainda.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-md bg-muted/50 p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{c.author_name}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Adicionar observação..."
                  className="min-h-[60px] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendComment();
                  }}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || addComment.isPending}
                  className="shrink-0 self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-muted-foreground">
                Criado em {formatDateShort(card.created_at)}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir card?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é irreversível. O card "{card.name}" será permanentemente removido.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
