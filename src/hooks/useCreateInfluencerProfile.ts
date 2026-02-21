import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { sendInfluencerWebhook } from '@/services/webhookService';
import { useAuth } from '@/contexts/AuthContext';

type InfluencerInsert = TablesInsert<'influencers'>;

export function useCreateInfluencerProfile() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

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

    const { data: created, error: insertError } = await supabase
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

    // Send webhook
    if (created) {
      const webhookData = {
        id: created.id,
        fullName: created.full_name,
        cpf: created.cpf,
        email: created.email,
        phone: created.phone,
        pixKey: created.pix_key,
        address: {
          street: created.address_street,
          number: created.address_number,
          complement: created.address_complement || undefined,
          neighborhood: created.address_neighborhood,
          city: created.address_city,
          state: created.address_state,
          zipCode: created.address_zip_code,
        },
        couponPreference: created.coupon_preference,
        instagram: created.instagram || undefined,
        university: created.university || undefined,
        period: created.period || undefined,
        isDoctor: created.is_doctor,
        yearsAsMedic: created.years_as_medic || undefined,
        status: 'active' as const,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      };
      await sendInfluencerWebhook('create', webhookData, profile);
    }

    return { success: true, data: created };
  };

  return { createInfluencerProfile, creating, error };
}
