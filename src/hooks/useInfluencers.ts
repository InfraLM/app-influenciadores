import { useState, useEffect, useCallback } from 'react';
import { api } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Influencer = Tables<'influencers'>;

export function useInfluencers() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await api
      .from('influencers')
      .select('*')
      .order('full_name');

    if (fetchError) {
      console.error('Error fetching influencers:', fetchError);
      setError(fetchError.message);
      setInfluencers([]);
    } else {
      setInfluencers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  return { influencers, loading, error, refetch: fetchInfluencers };
}
