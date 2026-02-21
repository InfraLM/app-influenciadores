import { useState } from 'react';
import { FileText, Upload, Download, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDocuments, useCreateDocument, useDeleteDocument, DocumentRecord } from '@/hooks/useDocuments';
import { normalizeUrl } from '@/lib/externalLinks';

const categoryLabels: Record<string, string> = {
  briefing_institutional: 'Briefing e Institucional',
  rules: 'Modelo de Parceria',
};

const categoryColors: Record<string, string> = {
  briefing_institutional: 'bg-primary/20 text-primary',
  rules: 'bg-warning/20 text-warning',
};

export default function Documents() {
  const { isTeam, profile, user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteDocument, setDeleteDocument] = useState<DocumentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);

  // Real data from database
  const { data: documents = [], isLoading } = useDocuments(filterCategory);
  const createDocument = useCreateDocument();
  const deleteDocumentMutation = useDeleteDocument();

  const handleDownload = (doc: DocumentRecord) => {
    const url = normalizeUrl(doc.file_url);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Link do documento inválido');
    }
  };

  const handleDelete = async (doc: DocumentRecord) => {
    try {
      await deleteDocumentMutation.mutateAsync(doc.id);
      toast.success(`Documento removido: ${doc.title}`);
      setDeleteDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao remover documento');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('');
    setFormDescription('');
    setFormFile(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle || !formCategory || !formFile) {
      toast.error('Preencha todos os campos obrigatórios e selecione um arquivo');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload file to storage
      const fileExt = formFile.name.split('.').pop() || 'pdf';
      const fileName = `${Date.now()}-${formTitle.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, formFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        toast.error(`Falha ao enviar arquivo: ${uploadError.message}`);
        return;
      }

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // 3. Create document record in database
      await createDocument.mutateAsync({
        title: formTitle,
        description: formDescription || null,
        category: formCategory as 'briefing_institutional' | 'rules',
        file_url: urlData.publicUrl,
        uploaded_by_user_id: user?.id || '',
        uploaded_by_name: profile?.name || 'Sistema',
      });

      toast.success('Documento enviado com sucesso!');
      resetForm();
      setIsUploadOpen(false);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Falha ao salvar documento. Verifique os logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Documentos
          </h1>
          <p className="page-description">
            Briefings, orientações e materiais da parceria
          </p>
        </div>
        {isTeam && (
          <Dialog open={isUploadOpen} onOpenChange={(open) => {
            setIsUploadOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Documento</DialogTitle>
                <DialogDescription>
                  Adicione um novo documento para os influenciadores
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleUpload}>
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Briefing Mensal - Março 2025"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="briefing_institutional">Briefing e Institucional</SelectItem>
                      <SelectItem value="rules">Modelo de Parceria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Breve descrição do documento"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Fazer Upload'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem value="briefing_institutional">Briefing e Institucional</SelectItem>
            <SelectItem value="rules">Modelo de Parceria</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {documents.length} documento(s) encontrado(s)
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        <div className="stat-card text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum documento encontrado</p>
          {isTeam && (
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Novo Documento" para adicionar o primeiro
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="stat-card group flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{doc.title}</h3>
                  <Badge className={`mt-1 ${categoryColors[doc.category] || ''}`}>
                    {categoryLabels[doc.category] || doc.category}
                  </Badge>
                </div>
              </div>
              {doc.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
              )}
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <p>{new Date(doc.created_at).toLocaleDateString('pt-BR')}</p>
                  <p>por {doc.uploaded_by_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                    className="h-8 w-8"
                    title="Baixar / Abrir"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {isTeam && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDocument(doc)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteDocument} onOpenChange={() => setDeleteDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento "{deleteDocument?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDocument && handleDelete(deleteDocument)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
