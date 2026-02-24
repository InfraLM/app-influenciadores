import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type {
  PipelineType, ProspectStatus, RejectionReason,
  ProspectCard, ProspectComment, ReopenEntry,
} from '@/types/prospect';
import { STATUS_DATE_MAP, extractInstagramHandle } from '@/types/prospect';

export function useProspectCards() {
  return useQuery({
    queryKey: ['prospect-cards'],
    queryFn: async () => {
      const { data, error } = await (api as any)
        .from('prospect_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProspectCard[];
    },
  });
}

export function useCreateProspectCard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (card: {
      pipeline_type: PipelineType;
      name: string;
      instagram_url: string;
      size_category: string;
      niche: string;
      state_uf?: string;
      city?: string;
      whatsapp?: string;
      followers?: number;
    }) => {
      const { data, error } = await (api as any)
        .from('prospect_cards')
        .insert({
          ...card,
          status: 'contato_inicial' as ProspectStatus,
          date_first_contact: new Date().toISOString(),
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ProspectCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect-cards'] });
      toast({ title: 'Card criado com sucesso' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao criar card', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateProspectCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProspectCard> & { id: string }) => {
      const { data, error } = await (api as any)
        .from('prospect_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ProspectCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect-cards'] });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    },
  });
}

export function useMoveProspectCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id, newStatus, currentCard, rejectionReason, rejectionNotes,
    }: {
      id: string;
      newStatus: ProspectStatus;
      currentCard: ProspectCard;
      rejectionReason?: RejectionReason;
      rejectionNotes?: string;
    }) => {
      const updates: Record<string, any> = {
        status: newStatus,
        date_last_contact: new Date().toISOString(),
      };

      const dateField = STATUS_DATE_MAP[newStatus];
      if (dateField && !currentCard[dateField as keyof ProspectCard]) {
        updates[dateField] = new Date().toISOString();
      }

      if (newStatus === 'nao_prosseguir') {
        updates.rejection_reason = rejectionReason;
        updates.rejection_notes = rejectionNotes || null;
      }

      if (currentCard.status === 'nao_prosseguir' && newStatus !== 'nao_prosseguir') {
        updates.rejection_reason = null;
        updates.rejection_notes = null;
      }

      const { data, error } = await (api as any)
        .from('prospect_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ProspectCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect-cards'] });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao mover card', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteProspectCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (api as any)
        .from('prospect_cards')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect-cards'] });
      toast({ title: 'Card excluído com sucesso' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    },
  });
}

export function useProspectComments(cardId: string | null) {
  return useQuery({
    queryKey: ['prospect-comments', cardId],
    queryFn: async () => {
      if (!cardId) return [];
      const { data, error } = await (api as any)
        .from('prospect_comments')
        .select('*')
        .eq('prospect_card_id', cardId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as ProspectComment[];
    },
    enabled: !!cardId,
  });
}

export function useAddProspectComment() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ cardId, content }: { cardId: string; content: string }) => {
      const { data, error } = await (api as any)
        .from('prospect_comments')
        .insert({
          prospect_card_id: cardId,
          content,
          author_name: profile?.name || 'Admin',
          author_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ProspectComment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prospect-comments', data.prospect_card_id] });
    },
  });
}

export function useReopenHistory(cardId: string | null) {
  return useQuery({
    queryKey: ['prospect-reopen', cardId],
    queryFn: async () => {
      if (!cardId) return [];
      const { data, error } = await (api as any)
        .from('prospect_reopen_history')
        .select('*')
        .eq('prospect_card_id', cardId)
        .order('reopened_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ReopenEntry[];
    },
    enabled: !!cardId,
  });
}

export function useAddReopenHistory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const { error } = await (api as any)
        .from('prospect_reopen_history')
        .insert({ prospect_card_id: cardId, reopened_by: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect-reopen'] });
    },
  });
}

export function useConvertProspect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: ProspectCard) => {
      const handle = extractInstagramHandle(card.instagram_url);

      const { data: influencer, error: inflErr } = await api
        .from('influencers')
        .insert({
          full_name: card.name,
          instagram: handle.startsWith('@') ? handle : `@${handle}`,
          cpf: 'A preencher',
          email: `prospeccao.${card.id.substring(0, 8)}@placeholder.local`,
          phone: card.whatsapp || 'A preencher',
          pix_key: 'A preencher',
          address_street: 'A preencher',
          address_number: '-',
          address_neighborhood: 'A preencher',
          address_city: card.city || 'A preencher',
          address_state: card.state_uf || 'SP',
          address_zip_code: '00000-000',
          coupon_preference: 'A preencher',
          status: 'active',
        })
        .select('id')
        .single();
      if (inflErr) throw inflErr;

      const { error: updateErr } = await (api as any)
        .from('prospect_cards')
        .update({
          converted_influencer_id: influencer.id,
          converted_from_pipeline_type: card.pipeline_type,
        })
        .eq('id', card.id);
      if (updateErr) throw updateErr;

      return influencer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospect-cards'] });
      toast({
        title: 'Parceria confirmada!',
        description: 'Perfil de influenciador criado. Complete o cadastro na aba Influenciadores.',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Erro na conversão', description: err.message, variant: 'destructive' });
    },
  });
}
