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
import { useAuth } from '@/contexts/AuthContext';
import { useCreateInfluencerProfile } from '@/hooks/useCreateInfluencerProfile';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';

const createSchema = z.object({
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
  years_as_medic: z.number().optional().nullable(),
});

type CreateFormData = z.infer<typeof createSchema>;

interface CreateInfluencerProfileFormProps {
  onCreated: () => void;
}

export function CreateInfluencerProfileForm({ onCreated }: CreateInfluencerProfileFormProps) {
  const { user, profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const { createInfluencerProfile, creating } = useCreateInfluencerProfile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      full_name: profile?.name || '',
      email: profile?.email || user?.email || '',
      cpf: '',
      phone: '',
      pix_key: '',
      address_street: '',
      address_number: '',
      address_complement: '',
      address_neighborhood: '',
      address_city: '',
      address_state: '',
      address_zip_code: '',
      coupon_preference: '',
      instagram: '',
      university: '',
      period: '',
      is_doctor: false,
      years_as_medic: null,
    },
  });

  const isDoctor = watch('is_doctor');

  useEffect(() => {
    if (!isDoctor) {
      setValue('years_as_medic', null);
    }
  }, [isDoctor, setValue]);

  const onSubmit = async (data: CreateFormData) => {
    const result = await createInfluencerProfile({
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
    });

    if (result.success) {
      toast.success('Perfil criado com sucesso!');
      onCreated();
    } else {
      toast.error(result.error || 'Erro ao criar perfil');
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
          userId={user?.id || ''}
          currentUrl={avatarUrl}
          name={profile?.name || 'Usuário'}
          onUpload={handleAvatarUpload}
          disabled={creating}
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
            {errors.address_street && (
              <p className="text-sm text-destructive">{errors.address_street.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_number">Número *</Label>
            <Input id="address_number" {...register('address_number')} />
            {errors.address_number && (
              <p className="text-sm text-destructive">{errors.address_number.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_complement">Complemento</Label>
            <Input id="address_complement" {...register('address_complement')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_neighborhood">Bairro *</Label>
            <Input id="address_neighborhood" {...register('address_neighborhood')} />
            {errors.address_neighborhood && (
              <p className="text-sm text-destructive">{errors.address_neighborhood.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_city">Cidade *</Label>
            <Input id="address_city" {...register('address_city')} />
            {errors.address_city && (
              <p className="text-sm text-destructive">{errors.address_city.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_state">Estado *</Label>
            <Input id="address_state" {...register('address_state')} placeholder="SP" maxLength={2} />
            {errors.address_state && (
              <p className="text-sm text-destructive">{errors.address_state.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_zip_code">CEP *</Label>
            <Input id="address_zip_code" {...register('address_zip_code')} placeholder="00000-000" />
            {errors.address_zip_code && (
              <p className="text-sm text-destructive">{errors.address_zip_code.message}</p>
            )}
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
        <Button type="submit" disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Criar Perfil
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
