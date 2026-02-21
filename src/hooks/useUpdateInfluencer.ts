import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TablesUpdate, Tables } from '@/integrations/supabase/types';
import { sendInfluencerWebhook } from '@/services/webhookService';
import { useAuth } from '@/contexts/AuthContext';

type InfluencerUpdate = TablesUpdate<'influencers'>;

export function useUpdateInfluencer(influencerId: string | undefined) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

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

    // Send webhook with updated influencer data
    if (data) {
      const webhookData = mapInfluencerToWebhook(data);
      await sendInfluencerWebhook('update', webhookData, profile);
    }

    return { success: true, data };
  };

  return { updateInfluencer, saving, error };
}

// Helper to map DB influencer to webhook format
function mapInfluencerToWebhook(inf: Tables<'influencers'>) {
  return {
    id: inf.id,
    fullName: inf.full_name,
    cpf: inf.cpf,
    email: inf.email,
    phone: inf.phone,
    pixKey: inf.pix_key,
    address: {
      street: inf.address_street,
      number: inf.address_number,
      complement: inf.address_complement || undefined,
      neighborhood: inf.address_neighborhood,
      city: inf.address_city,
      state: inf.address_state,
      zipCode: inf.address_zip_code,
    },
    couponPreference: inf.coupon_preference,
    generatedCoupon: inf.generated_coupon || undefined,
    referralLink: inf.referral_link || undefined,
    instagram: inf.instagram || undefined,
    university: inf.university || undefined,
    period: inf.period || undefined,
    isDoctor: inf.is_doctor,
    yearsAsMedic: inf.years_as_medic || undefined,
    contractUrl: inf.contract_url || undefined,
    partnershipStartDate: inf.partnership_start_date || undefined,
    partnershipEndDate: inf.partnership_end_date || undefined,
    postingDates: inf.posting_dates || undefined,
    status: (inf.status === 'inactive' ? 'ended' : 'active') as 'active' | 'ended',
    profilePhotoUrl: inf.profile_photo_url || undefined,
    createdAt: inf.created_at,
    updatedAt: inf.updated_at,
  };
}
