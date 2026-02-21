import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createInvite, getInviteLink } from '@/services/userService';
import { Copy, Link, Check, Share2 } from 'lucide-react';
import type { AppRole, Influencer } from '@/types/users';

interface GenerateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GenerateLinkDialog({ open, onOpenChange, onSuccess }: GenerateLinkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    role: 'influencer' as AppRole,
    influencerId: '',
    expiresInDays: 7,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchInfluencers();
      setInviteLink(null);
      setCopied(false);
    }
  }, [open]);

  const fetchInfluencers = async () => {
    const { data } = await supabase
      .from('influencers')
      .select('id, full_name, email, user_id')
      .is('user_id', null)
      .order('full_name');
    setInfluencers(data || []);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await createInvite({
        role: formData.role,
        influencerId: formData.influencerId || undefined,
        expiresInDays: formData.expiresInDays,
      });

      const link = getInviteLink(result.invite.token);
      setInviteLink(link);

      toast({
        title: 'Link gerado',
        description: 'O link de convite foi gerado com sucesso.',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar link',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Link copiado',
        description: 'O link foi copiado para a área de transferência.',
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (inviteLink) {
      const message = encodeURIComponent(`Olá! Você foi convidado para acessar a plataforma Liberdade Médica. Acesse o link para criar sua conta:\n\n${inviteLink}`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  const handleClose = () => {
    setFormData({
      role: 'influencer',
      influencerId: '',
      expiresInDays: 7,
    });
    setInviteLink(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Link className="inline-block mr-2 h-5 w-5" />
            Gerar Link de Convite
          </DialogTitle>
          <DialogDescription>
            Gere um link para compartilhar via WhatsApp ou outro canal.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Link de convite:</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1 text-sm" />
                <Button onClick={handleCopyLink} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShareWhatsApp} variant="default" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar no WhatsApp
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-role">Perfil</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: AppRole) => setFormData({ ...formData, role: value, influencerId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="influencer">Influenciador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.role === 'influencer' && (
                <div className="space-y-2">
                  <Label htmlFor="link-influencer">Vincular Influenciador</Label>
                  <Select
                    value={formData.influencerId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, influencerId: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {influencers.map((inf) => (
                        <SelectItem key={inf.id} value={inf.id}>
                          {inf.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="link-expires">Validade</Label>
                <Select
                  value={String(formData.expiresInDays)}
                  onValueChange={(value) => setFormData({ ...formData, expiresInDays: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Gerando...' : 'Gerar Link'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
