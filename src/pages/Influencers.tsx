import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { InfluencerForm } from '@/components/influencers/InfluencerForm';
import { AdminInfluencerEditForm } from '@/components/influencers/AdminInfluencerEditForm';
import { InfluencerDetailsView } from '@/components/influencers/InfluencerDetailsView';
import { useInfluencers } from '@/hooks/useInfluencers';
import { useAuth } from '@/contexts/AuthContext';
import { sendInfluencerWebhook } from '@/services/webhookService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Influencer = Tables<'influencers'>;

export default function Influencers() {
  const { profile } = useAuth();
  const { influencers, loading, refetch } = useInfluencers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [viewingInfluencer, setViewingInfluencer] = useState<Influencer | null>(null);
  const [deleteInfluencer, setDeleteInfluencer] = useState<Influencer | null>(null);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingInfluencer(null);
    refetch();
  };

  const handleDelete = async (influencer: Influencer) => {
    const { error } = await supabase
      .from('influencers')
      .delete()
      .eq('id', influencer.id);

    if (error) {
      toast.error(error.message || 'Erro ao excluir');
      return;
    }

    // Send webhook
    const webhookData = {
      id: influencer.id,
      fullName: influencer.full_name,
      cpf: influencer.cpf,
      email: influencer.email,
      phone: influencer.phone,
      pixKey: influencer.pix_key,
      address: {
        street: influencer.address_street,
        number: influencer.address_number,
        complement: influencer.address_complement || undefined,
        neighborhood: influencer.address_neighborhood,
        city: influencer.address_city,
        state: influencer.address_state,
        zipCode: influencer.address_zip_code,
      },
      couponPreference: influencer.coupon_preference,
      isDoctor: influencer.is_doctor,
      status: 'ended' as const,
      createdAt: influencer.created_at,
      updatedAt: influencer.updated_at,
    };
    await sendInfluencerWebhook('delete', webhookData, profile);

    toast.success(`Influenciador ${influencer.full_name} removido`);
    setDeleteInfluencer(null);
    refetch();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredInfluencers = influencers.filter(
    (influencer) =>
      influencer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      influencer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      influencer.instagram?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 className="page-title">Influenciadores</h1>
          <p className="page-description">
            Gerencie os influenciadores parceiros da Liberdade Médica
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Influenciador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Influenciador</DialogTitle>
              <DialogDescription>
                Preencha os dados para cadastrar um novo influenciador
              </DialogDescription>
            </DialogHeader>
            <InfluencerForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou Instagram..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Instagram</th>
              <th>Email</th>
              <th>Cupom</th>
              <th>Status</th>
              <th>Início</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredInfluencers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'Nenhum influenciador encontrado' : 'Nenhum influenciador cadastrado'}
                </td>
              </tr>
            ) : (
              filteredInfluencers.map((influencer) => (
                <tr key={influencer.id} className="animate-fade-in">
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={influencer.profile_photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(influencer.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{influencer.full_name}</p>
                        <p className="text-sm text-muted-foreground">{influencer.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{influencer.instagram || '-'}</td>
                  <td className="text-muted-foreground">{influencer.email}</td>
                  <td>
                    {influencer.generated_coupon ? (
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {influencer.generated_coupon}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td>
                    <Badge
                      variant={influencer.status === 'active' ? 'default' : 'secondary'}
                      className={
                        influencer.status === 'active'
                          ? 'bg-success/20 text-success hover:bg-success/30'
                          : ''
                      }
                    >
                      {influencer.status === 'active' ? 'Ativo' : 'Encerrado'}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground">
                    {influencer.partnership_start_date
                      ? new Date(influencer.partnership_start_date).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingInfluencer(influencer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingInfluencer(influencer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteInfluencer(influencer)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingInfluencer} onOpenChange={() => setEditingInfluencer(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Influenciador</DialogTitle>
            <DialogDescription>
              Atualize os dados do influenciador, incluindo informações da parceria
            </DialogDescription>
          </DialogHeader>
          {editingInfluencer && (
            <AdminInfluencerEditForm
              influencer={editingInfluencer}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingInfluencer(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewingInfluencer} onOpenChange={() => setViewingInfluencer(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Influenciador</DialogTitle>
          </DialogHeader>
          {viewingInfluencer && (
            <InfluencerDetailsView
              influencer={viewingInfluencer}
              onClose={() => setViewingInfluencer(null)}
              onEdit={setEditingInfluencer}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteInfluencer} onOpenChange={() => setDeleteInfluencer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o influenciador {deleteInfluencer?.full_name}?
              Este influenciador pode estar vinculado a um card de prospecção. Ao excluir, o vínculo será removido do card automaticamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteInfluencer && handleDelete(deleteInfluencer)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
