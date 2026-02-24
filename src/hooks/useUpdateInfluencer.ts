import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TablesUpdate } from '@/integrations/supabase/types';

type InfluencerUpdate = TablesUpdate<'influencers'>;

export function useUpdateInfluencer(influencerId: string | undefined) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInfluencer = async (updates: InfluencerUpdate) => {
    if (!influencerId) {
      setError('Influenciador não encontrado');
      return { success: false, error: 'Influenciador não encontrado' };
    }

    setSaving(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from('influencers')
      .update(updates)
      .eq('id', influencerId)
      .select()
      .single();

    setSaving(false);

    if (updateError) {
      const msg = updateError.message || 'Erro ao salvar';
      setError(msg);
      return { success: false, error: msg };
    }

    return { success: true, data };
  };

  return { updateInfluencer, saving, error };
}
