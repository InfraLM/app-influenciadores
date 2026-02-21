import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyGoals {
  id: string;
  month_year: string;
  target_active_influencers: number;
  target_registered_contents: number;
  target_leads: number;
  target_sales: number;
}

export function useMonthlyGoals(monthYear: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['monthly-goals', monthYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('month_year', monthYear)
        .maybeSingle();

      if (error) {
        console.error('Error fetching monthly goals:', error);
        return null;
      }
      return data as MonthlyGoals | null;
    },
    enabled: !!monthYear,
  });

  const upsertMutation = useMutation({
    mutationFn: async (goals: Omit<MonthlyGoals, 'id'>) => {
      const { data, error } = await supabase
        .from('monthly_goals')
        .upsert(
          {
            month_year: goals.month_year,
            target_active_influencers: goals.target_active_influencers,
            target_registered_contents: goals.target_registered_contents,
            target_leads: goals.target_leads,
            target_sales: goals.target_sales,
          },
          { onConflict: 'month_year' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-goals', monthYear] });
    },
  });

  return {
    goals: query.data,
    isLoading: query.isLoading,
    upsertGoals: upsertMutation.mutateAsync,
    isUpserting: upsertMutation.isPending,
  };
}
