import { useState } from 'react';
import { api } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

type InfluencerInsert = TablesInsert<'influencers'>;

export function useCreateInfluencerProfile() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createInfluencerProfile = async (data: Omit<InfluencerInsert, 'user_id'>) => {
    if (!user) {
      setError('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    setCreating(true);
    setError(null);

    const insertData: InfluencerInsert = {
      ...data,
      user_id: user.id,
    };

    const { data: created, error: insertError } = await api
      .from('influencers')
      .insert(insertData)
      .select()
      .single();

    setCreating(false);

    if (insertError) {
      const msg = insertError.message || 'Erro ao criar perfil';
      setError(msg);
      return { success: false, error: msg };
    }

    return { success: true, data: created };
  };

  return { createInfluencerProfile, creating, error };
}
