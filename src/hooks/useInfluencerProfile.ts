import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Influencer = Tables<'influencers'>;

export function useInfluencerProfile(userId: string | undefined) {
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInfluencer = useCallback(async () => {
    if (!userId) {
      setInfluencer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching influencer profile:', error);
      setInfluencer(null);
    } else {
      setInfluencer(data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchInfluencer();
  }, [fetchInfluencer]);

  const refetch = () => {
    fetchInfluencer();
  };

  return { influencer, loading, refetch };
}
