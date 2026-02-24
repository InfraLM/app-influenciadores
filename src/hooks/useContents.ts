import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ContentRecord {
  id: string;
  influencer_id: string;
  month_year: string;
  type: 'feed' | 'story';
  post_date: string;
  product: string;
  reach: number;
  interactions: number;
  notes: string | null;
  content_link: string | null;
  proof_url: string | null;
  is_extra: boolean;
  created_at: string;
  updated_at: string;
  influencer?: {
    full_name: string;
  };
}

export interface ContentInsert {
  influencer_id: string;
  month_year: string;
  type: 'feed' | 'story';
  post_date: string;
  product: string;
  reach: number;
  interactions: number;
  notes?: string | null;
  content_link?: string | null;
  proof_url?: string | null;
  is_extra: boolean;
}

export function useContents(monthYear: string, influencerFilter?: string) {
  const { influencerId, isInfluencer } = useAuth();

  return useQuery({
    queryKey: ['contents', monthYear, influencerFilter, influencerId],
    queryFn: async () => {
      let query = api
        .from('contents')
        .select(`
          *,
          influencer:influencers(full_name)
        `)
        .eq('month_year', monthYear)
        .order('post_date', { ascending: false });

      // If influencer, filter by their own influencer_id
      if (isInfluencer && influencerId) {
        query = query.eq('influencer_id', influencerId);
      } else if (influencerFilter && influencerFilter !== 'all') {
        // Admin filtering by specific influencer
        query = query.eq('influencer_id', influencerFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching contents:', error);
        throw error;
      }

      return (data || []) as ContentRecord[];
    },
    enabled: !!monthYear,
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: ContentInsert) => {
      const { data, error } = await api
        .from('contents')
        .insert(content)
        .select()
        .single();

      if (error) {
        console.error('Error creating content:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...content }: Partial<ContentInsert> & { id: string }) => {
      const { data, error } = await api
        .from('contents')
        .update(content)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating content:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api
        .from('contents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting content:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}
