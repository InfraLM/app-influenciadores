import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/supabase/client';

export interface MetricsFilters {
  monthYears: string[]; // array of YYYY-MM
  product?: string;
  followerMin?: number;
  followerMax?: number;
  influencerId?: string;
}

export interface ContentRow {
  id: string;
  influencer_id: string;
  month_year: string;
  type: string;
  post_date: string;
  product: string;
  reach: number;
  interactions: number;
  is_extra: boolean;
  influencer?: { full_name: string; instagram: string | null };
}

export interface EvalRow {
  id: string;
  influencer_id: string;
  month_year: string;
  content_quality_score: number;
  sales_score: number;
  engagement_score: number;
  partner_posture_score: number;
  bonus_score: number;
  total_score: number | null;
  leads: number;
  sales: number;
  influencer?: { full_name: string; instagram: string | null; profile_photo_url: string | null };
}

export interface InfluencerRow {
  id: string;
  full_name: string;
  instagram: string | null;
  status: string;
  profile_photo_url: string | null;
}

export function useMetricsContents(monthYears: string[]) {
  return useQuery({
    queryKey: ['metrics-contents', monthYears],
    queryFn: async () => {
      if (monthYears.length === 0) return [];
      const { data, error } = await api
        .from('contents')
        .select('*, influencer:influencers(full_name, instagram)')
        .in('month_year', monthYears)
        .order('post_date', { ascending: true });
      if (error) throw error;
      return (data || []) as ContentRow[];
    },
    enabled: monthYears.length > 0,
  });
}

export function useMetricsEvaluations(monthYears: string[]) {
  return useQuery({
    queryKey: ['metrics-evaluations', monthYears],
    queryFn: async () => {
      if (monthYears.length === 0) return [];
      const { data, error } = await api
        .from('performance_evaluations')
        .select('*, influencer:influencers(full_name, instagram, profile_photo_url)')
        .in('month_year', monthYears)
        .order('month_year', { ascending: true });
      if (error) throw error;
      return (data || []) as EvalRow[];
    },
    enabled: monthYears.length > 0,
  });
}

export function useActiveInfluencers() {
  return useQuery({
    queryKey: ['metrics-influencers'],
    queryFn: async () => {
      const { data, error } = await api
        .from('influencers')
        .select('id, full_name, instagram, status, profile_photo_url')
        .eq('status', 'active')
        .order('full_name');
      if (error) throw error;
      return (data || []) as InfluencerRow[];
    },
  });
}
