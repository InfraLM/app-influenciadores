import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { sendContentWebhook } from '@/services/webhookService';
import { uploadProofFile, uploadMultipleProofFiles } from '@/services/storageService';
import { useCreateContent, useUpdateContent, ContentRecord, ContentInsert } from '@/hooks/useContents';

interface ContentFormProps {
  open: boolean;
  onClose: () => void;
  editingContent: ContentRecord | null;
  isExtra: boolean;
  selectedMonth: string;
  influencerId: string;
}

const PRODUCTS = [
  'Formação em Paciente Grave Online',
  'Formação em Paciente Grave Presencial',
  'Pós-Graduação em Paciente Grave',
];

export function ContentForm({
  open,
  onClose,
  editingContent,
  isExtra,
  selectedMonth,
  influencerId,
}: ContentFormProps) {
  const { profile } = useAuth();
  const isEditing = !!editingContent;
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();

  const [formData, setFormData] = useState({
    type: 'feed' as 'feed' | 'story',
    postDate: '',
    product: '',
    reach: '',
    interactions: '',
    notes: '',
    contentLink: '',
    proofFile: null as File | null,
    storyScreenshots: [] as File[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingContent) {
      setFormData({
        type: editingContent.type,
        postDate: editingContent.post_date,
        product: editingContent.product,
        reach: String(editingContent.reach),
        interactions: String(editingContent.interactions),
        notes: editingContent.notes || '',
        contentLink: editingContent.content_link || '',
        proofFile: null,
        storyScreenshots: [],
      });
    } else {
      setFormData({
        type: 'feed',
        postDate: '',
        product: '',
        reach: '',
        interactions: '',
        notes: '',
        contentLink: '',
        proofFile: null,
        storyScreenshots: [],
      });
    }
  }, [editingContent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Validate influencerId ---
    if (!influencerId) {
      const msg = 'Seu usuário ainda não está vinculado a um perfil de influenciador. Contate o administrador.';
      console.error('[ContentForm] Submit blocked: influencerId is null/undefined', { influencerId, selectedMonth });
      toast.error(msg);
      return;
    }

    if (!selectedMonth) {
      toast.error('Mês/ano não selecionado.');
      return;
    }

    if (!formData.postDate || !formData.product || !formData.reach || !formData.interactions) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.type === 'feed' && !formData.contentLink && !editingContent) {
      toast.error('Link do conteúdo é obrigatório para posts de Feed');
      return;
    }

    // Validate proof upload for new content
    if (!isEditing) {
      if (formData.type === 'feed' && !formData.proofFile) {
        toast.error('Comprovação (print) é obrigatória para novos conteúdos de Feed');
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      influencer_id: influencerId,
      month_year: selectedMonth,
      type: formData.type,
      post_date: formData.postDate,
      product: formData.product,
      reach: parseInt(formData.reach),
      interactions: parseInt(formData.interactions),
      notes: formData.notes || null,
      content_link: formData.contentLink || null,
      is_extra: isExtra,
    };

    console.log('[ContentForm] Submitting content:', {
      isEditing,
      influencerId,
      monthYear: selectedMonth,
      payload,
    });

    try {
      // Upload proof file(s) to storage
      let proofUrl: string | null = editingContent?.proof_url || null;

      if (formData.type === 'feed' && formData.proofFile) {
        try {
          proofUrl = await uploadProofFile(
            formData.proofFile,
            influencerId,
            selectedMonth,
            'feed'
          );
        } catch (uploadErr: any) {
          console.error('[ContentForm] Upload error:', uploadErr);
          toast.error(`Falha no upload da comprovação: ${uploadErr?.message || 'Erro desconhecido'}`);
          setIsSubmitting(false);
          return;
        }
      } else if (formData.type === 'story' && formData.storyScreenshots.length > 0) {
        try {
          const urls = await uploadMultipleProofFiles(
            formData.storyScreenshots,
            influencerId,
            selectedMonth,
            'story'
          );
          proofUrl = urls[0] || null;
        } catch (uploadErr: any) {
          console.error('[ContentForm] Upload error (stories):', uploadErr);
          toast.error(`Falha no upload dos stories: ${uploadErr?.message || 'Erro desconhecido'}`);
          setIsSubmitting(false);
          return;
        }
      }

      const contentData: ContentInsert = {
        ...payload,
        proof_url: proofUrl,
      };

      if (isEditing && editingContent) {
        await updateContent.mutateAsync({
          id: editingContent.id,
          ...contentData,
        });
      } else {
        await createContent.mutateAsync(contentData);
      }

      // Send webhook for external integrations
      try {
        await sendContentWebhook(
          isEditing ? 'update' : 'create',
          {
            id: editingContent?.id || 'new',
            influencerId,
            monthYear: selectedMonth,
            type: formData.type,
            postDate: formData.postDate,
            product: formData.product,
            reach: parseInt(formData.reach),
            interactions: parseInt(formData.interactions),
            notes: formData.notes || undefined,
            contentLink: formData.contentLink || undefined,
            proofUrl: proofUrl || undefined,
            isExtra,
            createdAt: editingContent?.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          profile
        );
      } catch (webhookErr) {
        // Webhook failure should not block content save
        console.warn('[ContentForm] Webhook failed (non-blocking):', webhookErr);
      }

      toast.success(isEditing ? 'Conteúdo atualizado!' : 'Conteúdo registrado!');
      onClose();
    } catch (error: any) {
      console.error('[ContentForm] Error saving content:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        influencerId,
        monthYear: selectedMonth,
        payload,
      });

      // Build specific error message
      let errorMsg = 'Erro ao salvar conteúdo';
      if (error?.message) {
        if (error.message.includes('row-level security')) {
          errorMsg = 'Permissão negada: seu perfil pode não estar vinculado corretamente. Contate o administrador.';
        } else if (error.message.includes('duplicate')) {
          errorMsg = 'Registro duplicado detectado. Tente editar o conteúdo existente.';
        } else if (error.message.includes('violates foreign key')) {
          errorMsg = 'Perfil de influenciador não encontrado. Contate o administrador.';
        } else {
          errorMsg = `Erro: ${error.message}`;
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Conteúdo' : isExtra ? 'Adicionar Conteúdo Extra' : 'Adicionar Conteúdo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo de Conteúdo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'feed' | 'story') => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="story">Story</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Post date */}
          <div className="space-y-2">
            <Label>Data da Postagem *</Label>
            <Input
              type="date"
              value={formData.postDate}
              onChange={(e) => setFormData({ ...formData, postDate: e.target.value })}
              required
            />
          </div>

          {/* Product */}
          <div className="space-y-2">
            <Label>Curso/Produto Relacionado *</Label>
            <Select
              value={formData.product}
              onValueChange={(value) => setFormData({ ...formData, product: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alcance *</Label>
              <Input
                type="number"
                placeholder="Ex: 15000"
                value={formData.reach}
                onChange={(e) => setFormData({ ...formData, reach: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Interações *</Label>
              <Input
                type="number"
                placeholder="Ex: 850"
                value={formData.interactions}
                onChange={(e) => setFormData({ ...formData, interactions: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          {/* Content link (required for feed) */}
          {formData.type === 'feed' && (
            <div className="space-y-2">
              <Label>Link do Conteúdo *</Label>
              <Input
                type="text"
                placeholder="https://instagram.com/p/..."
                value={formData.contentLink}
                onChange={(e) => setFormData({ ...formData, contentLink: e.target.value })}
              />
            </div>
          )}

          {/* Proof upload - Feed */}
          {formData.type === 'feed' && (
            <div className="space-y-2">
              <Label>Comprovação de Visualizações e Interações {!isEditing && '*'}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, proofFile: e.target.files?.[0] || null })}
                required={!isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Print mostrando alcance e interações do post
              </p>
              {isEditing && editingContent?.proof_url && (
                <p className="text-xs text-muted-foreground">
                  ✅ Comprovação já enviada. Selecione um novo arquivo apenas se quiser substituir.
                </p>
              )}
            </div>
          )}

          {/* Story screenshots - multiple files */}
          {formData.type === 'story' && (
            <div className="space-y-2">
              <Label>Prints dos Stories</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const newFiles = e.target.files ? Array.from(e.target.files) : [];
                  setFormData({ 
                    ...formData, 
                    storyScreenshots: [...formData.storyScreenshots, ...newFiles] 
                  });
                  e.target.value = '';
                }}
              />
              <p className="text-xs text-muted-foreground">
                <strong>Importante:</strong> Tire um print de cada story que foi postado. 
                Você pode selecionar múltiplos arquivos de uma vez ou adicionar um de cada vez.
              </p>
              {isEditing && editingContent?.proof_url && (
                <p className="text-xs text-muted-foreground">
                  ✅ Comprovação já enviada. Adicione novos arquivos apenas se quiser complementar.
                </p>
              )}
              {formData.storyScreenshots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-primary font-medium">
                    {formData.storyScreenshots.length} arquivo(s) selecionado(s):
                  </p>
                  <ul className="space-y-1">
                    {formData.storyScreenshots.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => {
                            const newFiles = formData.storyScreenshots.filter((_, i) => i !== index);
                            setFormData({ ...formData, storyScreenshots: newFiles });
                          }}
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais (opcional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : isEditing ? 'Salvar Alterações' : 'Registrar Conteúdo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
