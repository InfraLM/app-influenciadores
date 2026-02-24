import { useQuery } from '@tanstack/react-query';
import { api } from '@/integrations/supabase/client';

export interface RankingEntryData {
  position: number;
  influencerId: string;
  influencerName: string;
  instagram: string | null;
  profilePhotoUrl: string | null;
  totalScore: number;
  isTopThree: boolean;
}

/**
 * Fetches ranking data for all active influencers using the secure
 * get_ranking RPC function (SECURITY DEFINER — bypasses RLS).
 * Returns only non-sensitive fields: name, instagram, photo, total_score.
 */
export function useRanking(monthYear: string) {
  return useQuery({
    queryKey: ['ranking', monthYear],
    queryFn: async () => {
      const { data, error } = await api.rpc('get_ranking', {
        p_month_year: monthYear,
      });

      if (error) {
        console.error('Error fetching ranking:', error);
        throw error;
      }

      const entries: RankingEntryData[] = (data || []).map(
        (row: any, index: number) => ({
          position: index + 1,
          influencerId: row.influencer_id,
          influencerName: row.full_name,
          instagram: row.instagram,
          profilePhotoUrl: row.profile_photo_url,
          totalScore: Number(row.total_score),
          isTopThree: index < 3,
        })
      );

      return entries;
    },
    enabled: !!monthYear,
  });
}
