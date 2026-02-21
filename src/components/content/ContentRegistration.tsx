import { useState } from 'react';
import { Plus, Image, Calendar, BarChart3, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Content } from '@/types';
import { ExternalLinkButton } from './ExternalLinkButton';

interface ContentRegistrationProps {
  influencerId: string;
  existingContents: Content[];
}

const products = [
  'Pós-Graduação Paciente Grave',
  'Curso de Emergência',
  'Mentoria Individual',
  'Workshop Intensivo',
];

export function ContentRegistration({ influencerId, existingContents }: ContentRegistrationProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contentType, setContentType] = useState<'feed' | 'story'>('feed');

  const currentMonth = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Conteúdo registrado com sucesso!');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Conteúdos de {currentMonth}</h3>
          <p className="text-sm text-muted-foreground">
            Registre seus conteúdos publicados com comprovação
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Conteúdo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Conteúdo</DialogTitle>
              <DialogDescription>
                Registre um conteúdo publicado com sua comprovação
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Conteúdo *</Label>
                <Select
                  value={contentType}
                  onValueChange={(val) => setContentType(val as 'feed' | 'story')}
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

              <div className="space-y-2">
                <Label>Data da Postagem *</Label>
                <Input type="date" required />
              </div>

              <div className="space-y-2">
                <Label>Curso / Produto *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Alcance *</Label>
                  <Input type="number" placeholder="Ex: 15000" required />
                </div>
                <div className="space-y-2">
                  <Label>Interações *</Label>
                  <Input type="number" placeholder="Ex: 850" required />
                </div>
              </div>

              {contentType === 'feed' && (
                <div className="space-y-2">
                  <Label>Link do Conteúdo *</Label>
                  <Input placeholder="https://instagram.com/p/..." required />
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  {contentType === 'feed'
                    ? 'Comprovação de Visualizações e Interações *'
                    : 'Comprovação de Stories (prints em uma imagem) *'}
                </Label>
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <Image className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Arraste ou clique para fazer upload
                  </p>
                  <Input type="file" accept="image/*" className="mt-2" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observação (opcional)</Label>
                <Textarea placeholder="Adicione uma observação sobre este conteúdo..." />
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <input type="checkbox" id="isExtra" className="rounded" />
                <Label htmlFor="isExtra" className="text-sm cursor-pointer">
                  Este é um conteúdo extra (além do obrigatório do mês)
                </Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Registrar Conteúdo</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Contents */}
      <div className="space-y-4">
        {existingContents.length === 0 ? (
          <div className="stat-card text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum conteúdo registrado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Registrar Conteúdo" para adicionar
            </p>
          </div>
        ) : (
          existingContents.map((content) => (
            <div key={content.id} className="stat-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    {content.type === 'feed' ? (
                      <Image className="h-5 w-5 text-primary" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {content.type === 'feed' ? 'Feed' : 'Story'}
                      </Badge>
                      {content.isExtra && (
                        <Badge className="bg-info/20 text-info">Extra</Badge>
                      )}
                    </div>
                    <p className="mt-1 font-medium">{content.product}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(content.postDate).toLocaleDateString('pt-BR')}
                      </span>
                      <span>Alcance: {content.reach.toLocaleString()}</span>
                      <span>Interações: {content.interactions.toLocaleString()}</span>
                    </div>
                    {content.contentLink && (
                      <div className="mt-2">
                        <ExternalLinkButton url={content.contentLink} label="Ver publicação" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
