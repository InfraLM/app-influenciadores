import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PerformanceEvaluation {
  id: string;
  influencer_id: string;
  month_year: string;
  content_quality_score: number;
  sales_score: number;
  engagement_score: number;
  partner_posture_score: number;
  bonus_score: number;
  total_score: number;
  leads: number;
  sales: number;
  qualitative_notes: string | null;
  quality_checklist: Record<string, boolean>;
  bonus_checklist: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  influencer?: {
    full_name: string;
    instagram: string | null;
    profile_photo_url: string | null;
  };
}

export interface PerformanceEvaluationInsert {
  influencer_id: string;
  month_year: string;
  content_quality_score?: number;
  sales_score?: number;
  engagement_score?: number;
  partner_posture_score?: number;
  bonus_score?: number;
  leads?: number;
  sales?: number;
  qualitative_notes?: string | null;
  quality_checklist?: Record<string, boolean>;
  bonus_checklist?: Record<string, boolean>;
}

// Fetch all evaluations for a specific month (for ranking)
export function useMonthlyEvaluations(monthYear: string) {
  return useQuery({
    queryKey: ['performance-evaluations', monthYear],
    queryFn: async () => {
      const { data, error } = await api
        .from('performance_evaluations')
        .select(`
          *,
          influencer:influencers(full_name, instagram, profile_photo_url)
        `)
        .eq('month_year', monthYear)
        .order('total_score', { ascending: false });

      if (error) {
        console.error('Error fetching evaluations:', error);
        throw error;
      }

      return (data || []) as PerformanceEvaluation[];
    },
    enabled: !!monthYear,
  });
}

// Fetch evaluation for a specific influencer and month
export function useInfluencerEvaluation(influencerId: string, monthYear: string) {
  return useQuery({
    queryKey: ['performance-evaluation', influencerId, monthYear],
    queryFn: async () => {
      const { data, error } = await api
        .from('performance_evaluations')
        .select('*')
        .eq('influencer_id', influencerId)
        .eq('month_year', monthYear)
        .maybeSingle();

      if (error) {
        console.error('Error fetching evaluation:', error);
        throw error;
      }

      return data as PerformanceEvaluation | null;
    },
    enabled: !!influencerId && !!monthYear,
  });
}

// Fetch own evaluation (for influencer view)
export function useOwnEvaluation(monthYear: string) {
  const { influencerId } = useAuth();

  return useQuery({
    queryKey: ['own-evaluation', influencerId, monthYear],
    queryFn: async () => {
      if (!influencerId) return null;

      const { data, error } = await api
        .from('performance_evaluations')
        .select('*')
        .eq('influencer_id', influencerId)
        .eq('month_year', monthYear)
        .maybeSingle();

      if (error) {
        console.error('Error fetching own evaluation:', error);
        throw error;
      }

      return data as PerformanceEvaluation | null;
    },
    enabled: !!influencerId && !!monthYear,
  });
}

// Create or update evaluation (upsert)
export function useUpsertEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evaluation: PerformanceEvaluationInsert) => {
      const { data, error } = await api
        .from('performance_evaluations')
        .upsert(evaluation, {
          onConflict: 'influencer_id,month_year',
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting evaluation:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['performance-evaluation', data.influencer_id] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
  });
}

// Delete evaluation
export function useDeleteEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api
        .from('performance_evaluations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting evaluation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
  });
}
