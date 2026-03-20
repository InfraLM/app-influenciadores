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
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';
import { useUpdateInfluencer } from '@/hooks/useUpdateInfluencer';

type Influencer = Tables<'influencers'>;

const editableSchema = z.object({
  full_name: z.string().min(1, 'Obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  pix_key: z.string().min(1, 'Obrigatório'),
  address_street: z.string().min(1, 'Obrigatório'),
  address_number: z.string().min(1, 'Obrigatório'),
  address_complement: z.string().optional().nullable(),
  address_neighborhood: z.string().min(1, 'Obrigatório'),
  address_city: z.string().min(1, 'Obrigatório'),
  address_state: z.string().min(2, 'Obrigatório'),
  address_zip_code: z.string().min(8, 'CEP inválido'),
  coupon_preference: z.string().min(1, 'Obrigatório'),
  instagram: z.string().optional().nullable(),
  university: z.string().optional().nullable(),
  period: z.string().optional().nullable(),
  is_doctor: z.boolean(),
  years_as_medic: z.preprocess(
    (val) => (val === '' || val === null || val === undefined || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().optional().nullable()
  ),
});

export type InfluencerFormData = z.infer<typeof editableSchema>;

interface InfluencerProfileFormProps {
  influencer: Influencer;
  userId: string;
  onSaved?: () => void;
}

export function InfluencerProfileForm({
  influencer,
  userId,
  onSaved,
}: InfluencerProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(influencer.profile_photo_url || '');
  const { updateInfluencer, saving } = useUpdateInfluencer(influencer.id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InfluencerFormData>({
    resolver: zodResolver(editableSchema),
    defaultValues: {
      full_name: influencer.full_name,
      cpf: influencer.cpf,
      email: influencer.email,
      phone: influencer.phone,
      pix_key: influencer.pix_key,
      address_street: influencer.address_street,
      address_number: influencer.address_number,
      address_complement: influencer.address_complement,
      address_neighborhood: influencer.address_neighborhood,
      address_city: influencer.address_city,
      address_state: influencer.address_state,
      address_zip_code: influencer.address_zip_code,
      coupon_preference: influencer.coupon_preference,
      instagram: influencer.instagram,
      university: influencer.university,
      period: influencer.period,
      is_doctor: influencer.is_doctor,
      years_as_medic: influencer.years_as_medic,
    },
  });

  const isDoctor = watch('is_doctor');

  useEffect(() => {
    if (!isDoctor) {
      setValue('years_as_medic', null);
    }
  }, [isDoctor, setValue]);

  const onSubmit = async (data: InfluencerFormData) => {
    const updates: TablesUpdate<'influencers'> = {
      full_name: data.full_name,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
      pix_key: data.pix_key,
      address_street: data.address_street,
      address_number: data.address_number,
      address_complement: data.address_complement || null,
      address_neighborhood: data.address_neighborhood,
      address_city: data.address_city,
      address_state: data.address_state,
      address_zip_code: data.address_zip_code,
      coupon_preference: data.coupon_preference,
      instagram: data.instagram || null,
      university: data.university || null,
      period: data.period || null,
      is_doctor: data.is_doctor,
      years_as_medic: data.years_as_medic ?? null,
      profile_photo_url: avatarUrl || null,
    };

    const result = await updateInfluencer(updates);
    if (result.success) {
      toast.success('Perfil atualizado com sucesso!');
      onSaved?.();
    } else {
      toast.error(result.error || 'Erro ao salvar');
    }
  };

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex justify-center">
        <ProfileAvatarUpload
          userId={userId}
          currentUrl={avatarUrl}
          name={influencer.full_name}
          onUpload={handleAvatarUpload}
          disabled={saving}
        />
      </div>

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
            <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
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
            <Input id="phone" {...register('phone')} placeholder="(00) 00000-0000" />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pix_key">Chave Pix *</Label>
            <Input id="pix_key" {...register('pix_key')} />
            {errors.pix_key && (
              <p className="text-sm text-destructive">{errors.pix_key.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="coupon_preference">Preferência de Nome para Cupom *</Label>
            <Input id="coupon_preference" {...register('coupon_preference')} placeholder="Ex: DRJOAO" />
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
            <Input id="address_state" {...register('address_state')} placeholder="SP" maxLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_zip_code">CEP *</Label>
            <Input id="address_zip_code" {...register('address_zip_code')} placeholder="00000-000" />
          </div>
        </div>
      </div>

      {/* Profissional */}
      <div className="form-section">
        <h3 className="mb-4 font-semibold">Dados Profissionais (opcional)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">@Instagram</Label>
            <Input id="instagram" {...register('instagram')} placeholder="@usuario" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">Faculdade</Label>
            <Input id="university" {...register('university')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Período / Ano</Label>
            <Input id="period" {...register('period')} placeholder="6º período" />
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
              <Label htmlFor="years_as_medic">Há quanto tempo é formado (anos)?</Label>
              <Input
                id="years_as_medic"
                type="number"
                {...register('years_as_medic', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
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
