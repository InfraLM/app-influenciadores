import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createUserDirect } from '@/services/userService';
import type { AppRole, UserStatus, Influencer } from '@/types/users';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'influencer' as AppRole,
    status: 'active' as UserStatus,
    influencerId: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchInfluencers();
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
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, e-mail e senha.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Senha inválida',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createUserDirect({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        influencerId: formData.influencerId || undefined,
      });

      toast({
        title: 'Usuário criado',
        description: 'O usuário foi criado com sucesso.',
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'influencer',
        status: 'active',
        influencerId: '',
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário com acesso direto à plataforma.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Perfil</Label>
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
              <Label htmlFor="influencer">Vincular Influenciador</Label>
              <Select
                value={formData.influencerId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, influencerId: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um influenciador (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (criar depois)</SelectItem>
                  {influencers.map((inf) => (
                    <SelectItem key={inf.id} value={inf.id}>
                      {inf.full_name} ({inf.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Apenas influenciadores sem usuário vinculado são exibidos
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
