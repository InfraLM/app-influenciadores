import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/integrations/supabase/client';
import { createInvite, getInviteLink } from '@/services/userService';
import { Copy, Mail, Check } from 'lucide-react';
import type { AppRole, Influencer } from '@/types/users';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    const { data } = await api
      .from('influencers')
      .select('id, full_name, email, user_id')
      .order('full_name');
    setInfluencers((data || []).filter((inf: any) => !inf.user_id));
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Informe o e-mail para enviar o convite.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createInvite({
        email: formData.email,
        name: formData.name || undefined,
        role: formData.role,
        influencerId: formData.influencerId || undefined,
        expiresInDays: formData.expiresInDays,
      });

      const link = getInviteLink(result.invite.token);
      setInviteLink(link);

      toast({
        title: 'Convite criado',
        description: 'O link de convite foi gerado. Copie e envie por e-mail.',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar convite',
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
        description: 'O link de convite foi copiado para a área de transferência.',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
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
            <Mail className="inline-block mr-2 h-5 w-5" />
            Convidar por E-mail
          </DialogTitle>
          <DialogDescription>
            Envie um convite para que o usuário crie sua conta.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Link de convite:</p>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button onClick={handleCopyLink} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Envie este link para {formData.email}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-mail *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-name">Nome (opcional)</Label>
                <Input
                  id="invite-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do convidado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Perfil</Label>
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
                  <Label htmlFor="invite-influencer">Vincular Influenciador</Label>
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
                <Label htmlFor="invite-expires">Validade (dias)</Label>
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
                {loading ? 'Gerando...' : 'Gerar Convite'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
