import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import type { PipelineType } from '@/types/prospect';
import { SIZE_CATEGORIES, BRAZILIAN_STATES, PIPELINE_LABELS, normalizeUrl } from '@/types/prospect';
import { useCreateProspectCard } from '@/hooks/useProspects';

export function CreateProspectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [sizeCategory, setSizeCategory] = useState('');
  const [niche, setNiche] = useState('');
  const [stateUf, setStateUf] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [followers, setFollowers] = useState('');
  const [pipelineType, setPipelineType] = useState<PipelineType | ''>('');

  const createCard = useCreateProspectCard();

  const isValid = name.trim() && instagramUrl.trim() && sizeCategory && niche.trim() && pipelineType;

  const handleSubmit = () => {
    if (!isValid) return;
    createCard.mutate(
      {
        pipeline_type: pipelineType as PipelineType,
        name: name.trim(),
        instagram_url: normalizeUrl(instagramUrl.trim()),
        size_category: sizeCategory,
        niche: niche.trim(),
        state_uf: stateUf || undefined,
        city: city.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        followers: followers ? Number(followers) : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setInstagramUrl('');
          setSizeCategory('');
          setNiche('');
          setStateUf('');
          setCity('');
          setWhatsapp('');
          setFollowers('');
          setPipelineType('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Novo Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden p-0">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle>Novo Prospect</DialogTitle>
            <DialogDescription>Preencha os dados do novo prospect para adicioná-lo ao pipeline.</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
            <div>
              <Label>Produto/Curso *</Label>
              <Select value={pipelineType} onValueChange={(v) => setPipelineType(v as PipelineType)}>
                <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(PIPELINE_LABELS) as PipelineType[]).map((pt) => (
                    <SelectItem key={pt} value={pt}>{PIPELINE_LABELS[pt]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <Label>Link do Instagram *</Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/perfil"
              />
            </div>
            <div>
              <Label>Categoria de Tamanho *</Label>
              <Select value={sizeCategory} onValueChange={setSizeCategory}>
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
              <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Ex: Dermatologia, Fitness..." />
            </div>
            <div>
              <Label>Seguidores (opcional)</Label>
              <Input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="Ex: 50000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>UF (opcional)</Label>
                <Select value={stateUf} onValueChange={setStateUf}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade (opcional)</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" />
              </div>
            </div>
            <div>
              <Label>WhatsApp (opcional)</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
          </div>

          {/* FIXED FOOTER - always visible */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-background shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={!isValid || createCard.isPending}>
              {createCard.isPending ? 'Criando...' : 'Criar Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
