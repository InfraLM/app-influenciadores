import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { api } from '@/integrations/supabase/client';

const influencerSchema = z.object({
  fullName: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  pixKey: z.string().min(1, 'Chave Pix é obrigatória'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP inválido'),
  couponPreference: z.string().min(1, 'Preferência de cupom é obrigatória'),
  instagram: z.string().optional(),
  university: z.string().optional(),
  period: z.string().optional(),
  isDoctor: z.boolean(),
  yearsAsMedic: z.number().optional(),
});

type InfluencerFormData = z.infer<typeof influencerSchema>;

interface InfluencerFormProps {
  onSuccess: () => void;
}

export function InfluencerForm({ onSuccess }: InfluencerFormProps) {
  const [isDoctor, setIsDoctor] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InfluencerFormData>({
    resolver: zodResolver(influencerSchema),
    defaultValues: {
      isDoctor: false,
    },
  });

  const onSubmit = async (data: InfluencerFormData) => {
    const { error } = await api
      .from('influencers')
      .insert({
        full_name: data.fullName,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        pix_key: data.pixKey,
        address_street: data.street,
        address_number: data.number,
        address_complement: data.complement || null,
        address_neighborhood: data.neighborhood,
        address_city: data.city,
        address_state: data.state,
        address_zip_code: data.zipCode,
        coupon_preference: data.couponPreference,
        instagram: data.instagram || null,
        university: data.university || null,
        period: data.period || null,
        is_doctor: data.isDoctor,
        years_as_medic: data.yearsAsMedic ?? null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message || 'Erro ao cadastrar influenciador');
      return;
    }

    toast.success('Influenciador cadastrado com sucesso!');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-section">
        <h3 className="mb-4 font-semibold">Dados Pessoais</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
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
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="pixKey">Chave Pix *</Label>
            <Input id="pixKey" {...register('pixKey')} />
            {errors.pixKey && (
              <p className="text-sm text-destructive">{errors.pixKey.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="couponPreference">Preferência de Nome para Cupom *</Label>
            <Input id="couponPreference" {...register('couponPreference')} placeholder="Ex: DRJOAO" />
            {errors.couponPreference && (
              <p className="text-sm text-destructive">{errors.couponPreference.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="mb-4 font-semibold">Endereço (para envio de Press Kit)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="street">Rua *</Label>
            <Input id="street" {...register('street')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input id="number" {...register('number')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" {...register('complement')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input id="neighborhood" {...register('neighborhood')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input id="state" {...register('state')} placeholder="SP" maxLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP *</Label>
            <Input id="zipCode" {...register('zipCode')} placeholder="00000-000" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="mb-4 font-semibold">Dados Profissionais (opcional)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
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
              id="isDoctor"
              checked={isDoctor}
              onCheckedChange={(checked) => setIsDoctor(checked)}
            />
            <Label htmlFor="isDoctor">Já é médico?</Label>
          </div>
          {isDoctor && (
            <div className="space-y-2">
              <Label htmlFor="yearsAsMedic">Há quanto tempo é formado (anos)?</Label>
              <Input
                id="yearsAsMedic"
                type="number"
                {...register('yearsAsMedic', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Influenciador'}
        </Button>
      </div>
    </form>
  );
}
