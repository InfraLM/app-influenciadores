import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/integrations/supabase/client';
import { LinkIcon, AlertTriangle } from 'lucide-react';
import type { AppRole, UserStatus, UserWithRole } from '@/types/users';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole | null;
  onSuccess: () => void;
}

interface InfluencerOption {
  id: string;
  full_name: string;
  user_id: string | null;
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [influencers, setInfluencers] = useState<InfluencerOption[]>([]);
  const [linkedInfluencerId, setLinkedInfluencerId] = useState<string>('none');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'influencer' as AppRole,
    status: 'active' as UserStatus,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role || 'influencer',
        status: user.status,
      });
    }
  }, [user]);

  // Fetch influencers and current link when dialog opens for an influencer-role user
  useEffect(() => {
    if (!open || !user) return;

    const fetchInfluencers = async () => {
      const { data } = await api
        .from('influencers')
        .select('id, full_name, user_id')
        .order('full_name');

      if (data) {
        setInfluencers(data);
        // Find if this user is already linked to an influencer
        const linked = data.find((i) => i.user_id === user.user_id);
        setLinkedInfluencerId(linked?.id || 'none');
      }
    };

    fetchInfluencers();
  }, [open, user]);

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await api
        .from('profiles')
        .update({
          name: formData.name,
          status: formData.status,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role if changed
      if (formData.role !== user.role) {
        const { error: roleError } = await api
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', user.user_id);

        if (roleError) throw roleError;
      }

      // Handle influencer linking
      if (formData.role === 'influencer') {
        const currentLinked = influencers.find((i) => i.user_id === user.user_id);
        const currentLinkedId = currentLinked?.id || 'none';

        if (linkedInfluencerId !== currentLinkedId) {
          // Unlink previous influencer if any
          if (currentLinked) {
            const { error: unlinkErr } = await api
              .from('influencers')
              .update({ user_id: null })
              .eq('id', currentLinked.id);
            if (unlinkErr) throw unlinkErr;
          }

          // Link new influencer
          if (linkedInfluencerId !== 'none') {
            const { error: linkErr } = await api
              .from('influencers')
              .update({ user_id: user.user_id })
              .eq('id', linkedInfluencerId);
            if (linkErr) throw linkErr;
          }
        }
      }

      toast({
        title: 'Usuário atualizado',
        description: 'As informações foram atualizadas com sucesso.',
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Available influencers: those not linked to anyone, or linked to this user
  const availableInfluencers = influencers.filter(
    (i) => !i.user_id || i.user_id === user?.user_id
  );

  const isInfluencerRole = formData.role === 'influencer';
  const currentlyLinked = influencers.find((i) => i.user_id === user?.user_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">E-mail</Label>
            <Input
              id="edit-email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Perfil</Label>
            <Select
              value={formData.role}
              onValueChange={(value: AppRole) => setFormData({ ...formData, role: value })}
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

          {/* Influencer linking section */}
          {isInfluencerRole && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Vincular a Influenciador
              </Label>
              <Select
                value={linkedInfluencerId}
                onValueChange={setLinkedInfluencerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um influenciador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (desvincular)</SelectItem>
                  {availableInfluencers.map((inf) => (
                    <SelectItem key={inf.id} value={inf.id}>
                      {inf.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {linkedInfluencerId === 'none' && !currentlyLinked && (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Sem vínculo, este usuário não poderá registrar conteúdos.
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground">
                Vincule este usuário a um perfil de influenciador para que ele possa registrar conteúdos.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: UserStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
