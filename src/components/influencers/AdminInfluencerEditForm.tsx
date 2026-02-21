import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { sendInfluencerWebhook } from '@/services/webhookService';
import { useAuth } from '@/contexts/AuthContext';

type Influencer = Tables<'influencers'>;

const adminEditSchema = z.object({
  // Personal data
  full_name: z.string().min(1, 'Obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  pix_key: z.string().min(1, 'Obrigatório'),
  coupon_preference: z.string().min(1, 'Obrigatório'),
  // Address
  address_street: z.string().min(1, 'Obrigatório'),
  address_number: z.string().min(1, 'Obrigatório'),
  address_complement: z.string().optional().nullable(),
  address_neighborhood: z.string().min(1, 'Obrigatório'),
  address_city: z.string().min(1, 'Obrigatório'),
  address_state: z.string().min(2, 'Obrigatório'),
  address_zip_code: z.string().min(8, 'CEP inválido'),
  // Professional
  instagram: z.string().optional().nullable(),
  university: z.string().optional().nullable(),
  period: z.string().optional().nullable(),
  is_doctor: z.boolean(),
  years_as_medic: z.number().optional().nullable(),
  // Partnership (admin-only)
  generated_coupon: z.string().optional().nullable(),
  referral_link: z.string().optional().nullable(),
  contract_url: z.string().optional().nullable(),
  partnership_start_date: z.string().optional().nullable(),
  partnership_end_date: z.string().optional().nullable(),
  posting_day_1: z.string().optional().nullable(),
  posting_day_2: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']),
});

type AdminEditFormData = z.infer<typeof adminEditSchema>;

interface AdminInfluencerEditFormProps {
  influencer: Influencer;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminInfluencerEditForm({
  influencer,
  onSuccess,
  onCancel,
}: AdminInfluencerEditFormProps) {
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);

  // Parse posting_dates array
  const postingDates = influencer.posting_dates || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdminEditFormData>({
    resolver: zodResolver(adminEditSchema),
    defaultValues: {
      full_name: influencer.full_name,
      cpf: influencer.cpf,
      email: influencer.email,
      phone: influencer.phone,
      pix_key: influencer.pix_key,
      coupon_preference: influencer.coupon_preference,
      address_street: influencer.address_street,
      address_number: influencer.address_number,
      address_complement: influencer.address_complement,
      address_neighborhood: influencer.address_neighborhood,
      address_city: influencer.address_city,
      address_state: influencer.address_state,
      address_zip_code: influencer.address_zip_code,
      instagram: influencer.instagram,
      university: influencer.university,
      period: influencer.period,
      is_doctor: influencer.is_doctor,
      years_as_medic: influencer.years_as_medic,
      generated_coupon: influencer.generated_coupon,
      referral_link: influencer.referral_link,
      contract_url: influencer.contract_url,
      partnership_start_date: influencer.partnership_start_date,
      partnership_end_date: influencer.partnership_end_date,
      posting_day_1: postingDates[0] || null,
      posting_day_2: postingDates[1] || null,
      status: influencer.status as 'active' | 'inactive',
    },
  });

  const isDoctor = watch('is_doctor');

  useEffect(() => {
    if (!isDoctor) {
      setValue('years_as_medic', null);
    }
  }, [isDoctor, setValue]);

  const onSubmit = async (data: AdminEditFormData) => {
    setSaving(true);

    // Build posting_dates array
    const postingDatesArray: string[] = [];
    if (data.posting_day_1) postingDatesArray.push(data.posting_day_1);
    if (data.posting_day_2) postingDatesArray.push(data.posting_day_2);

    const updates: TablesUpdate<'influencers'> = {
      full_name: data.full_name,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
      pix_key: data.pix_key,
      coupon_preference: data.coupon_preference,
      address_street: data.address_street,
      address_number: data.address_number,
      address_complement: data.address_complement || null,
      address_neighborhood: data.address_neighborhood,
      address_city: data.address_city,
      address_state: data.address_state,
      address_zip_code: data.address_zip_code,
      instagram: data.instagram || null,
      university: data.university || null,
      period: data.period || null,
      is_doctor: data.is_doctor,
      years_as_medic: data.years_as_medic ?? null,
      generated_coupon: data.generated_coupon || null,
      referral_link: data.referral_link || null,
      contract_url: data.contract_url || null,
      partnership_start_date: data.partnership_start_date || null,
      partnership_end_date: data.partnership_end_date || null,
      posting_dates: postingDatesArray.length > 0 ? postingDatesArray : null,
      status: data.status,
    };

    const { data: updated, error } = await supabase
      .from('influencers')
      .update(updates)
      .eq('id', influencer.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast.error(error.message || 'Erro ao salvar');
      return;
    }

    // Send webhook
    if (updated) {
      const webhookData = {
        id: updated.id,
        fullName: updated.full_name,
        cpf: updated.cpf,
        email: updated.email,
        phone: updated.phone,
        pixKey: updated.pix_key,
        address: {
          street: updated.address_street,
          number: updated.address_number,
          complement: updated.address_complement || undefined,
          neighborhood: updated.address_neighborhood,
          city: updated.address_city,
          state: updated.address_state,
          zipCode: updated.address_zip_code,
        },
        couponPreference: updated.coupon_preference,
        generatedCoupon: updated.generated_coupon || undefined,
        referralLink: updated.referral_link || undefined,
        instagram: updated.instagram || undefined,
        university: updated.university || undefined,
        period: updated.period || undefined,
        isDoctor: updated.is_doctor,
        yearsAsMedic: updated.years_as_medic || undefined,
        contractUrl: updated.contract_url || undefined,
        partnershipStartDate: updated.partnership_start_date || undefined,
        partnershipEndDate: updated.partnership_end_date || undefined,
        postingDates: updated.posting_dates || undefined,
        status: (updated.status === 'inactive' ? 'ended' : 'active') as 'active' | 'ended',
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
      await sendInfluencerWebhook('update', webhookData, profile);
    }

    toast.success('Influenciador atualizado com sucesso!');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados pessoais */}
      <div className="form-section">
        <h3 className="mb-4 font-semibold">Dados Pessoais</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input id="cpf" {...register('cpf')} />
            {errors.cpf && (
              <p className="text-sm text-destructive">{errors.cpf.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pix_key">Chave Pix *</Label>
            <Input id="pix_key" {...register('pix_key')} />
            {errors.pix_key && (
              <p className="text-sm text-destructive">{errors.pix_key.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon_preference">Preferência de Cupom *</Label>
            <Input id="coupon_preference" {...register('coupon_preference')} />
            {errors.coupon_preference && (
              <p className="text-sm text-destructive">{errors.coupon_preference.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="form-section">
        <h3 className="mb-4 font-semibold">Endereço (Press Kit)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_street">Rua *</Label>
            <Input id="address_street" {...register('address_street')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_number">Número *</Label>
            <Input id="address_number" {...register('address_number')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_complement">Complemento</Label>
            <Input id="address_complement" {...register('address_complement')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_neighborhood">Bairro *</Label>
            <Input id="address_neighborhood" {...register('address_neighborhood')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_city">Cidade *</Label>
            <Input id="address_city" {...register('address_city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_state">Estado *</Label>
            <Input id="address_state" {...register('address_state')} maxLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_zip_code">CEP *</Label>
            <Input id="address_zip_code" {...register('address_zip_code')} />
          </div>
        </div>
      </div>

      {/* Dados Profissionais */}
      <div className="form-section">
        <h3 className="mb-4 font-semibold">Dados Profissionais</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">@Instagram</Label>
            <Input id="instagram" {...register('instagram')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">Faculdade</Label>
            <Input id="university" {...register('university')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Período / Ano</Label>
            <Input id="period" {...register('period')} />
          </div>
          <div className="flex items-center gap-4 sm:col-span-2">
            <Switch
              id="is_doctor"
              checked={isDoctor}
              onCheckedChange={(v) => setValue('is_doctor', v)}
            />
            <Label htmlFor="is_doctor">Já é médico?</Label>
          </div>
          {isDoctor && (
            <div className="space-y-2">
              <Label htmlFor="years_as_medic">Anos como médico</Label>
              <Input
                id="years_as_medic"
                type="number"
                {...register('years_as_medic', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dados da Parceria (Admin only) */}
      <div className="form-section border-2 border-primary/20 bg-primary/5">
        <h3 className="mb-4 font-semibold text-primary">Dados da Parceria (Admin)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="generated_coupon">Cupom Gerado</Label>
            <Input id="generated_coupon" {...register('generated_coupon')} placeholder="Ex: DRJOAO10" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referral_link">Link de Divulgação</Label>
            <Input id="referral_link" {...register('referral_link')} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract_url">URL do Contrato</Label>
            <Input id="contract_url" {...register('contract_url')} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(v) => setValue('status', v as 'active' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_start_date">Data de Início</Label>
            <Input
              id="partnership_start_date"
              type="date"
              {...register('partnership_start_date')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnership_end_date">Data de Término</Label>
            <Input
              id="partnership_end_date"
              type="date"
              {...register('partnership_end_date')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="posting_day_1">Dia de Postagem 1</Label>
            <Input
              id="posting_day_1"
              {...register('posting_day_1')}
              placeholder="Ex: 5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="posting_day_2">Dia de Postagem 2</Label>
            <Input
              id="posting_day_2"
              {...register('posting_day_2')}
              placeholder="Ex: 20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
