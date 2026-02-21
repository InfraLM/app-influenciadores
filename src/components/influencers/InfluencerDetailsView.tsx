import { FileText, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Tables } from '@/integrations/supabase/types';

type Influencer = Tables<'influencers'>;

interface InfluencerDetailsViewProps {
  influencer: Influencer;
  onClose: () => void;
  onEdit: (influencer: Influencer) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-muted-foreground text-sm shrink-0">{label}:</span>
      <span className="text-sm text-right">{value || '-'}</span>
    </div>
  );
}

export function InfluencerDetailsView({ influencer, onClose, onEdit }: InfluencerDetailsViewProps) {
  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString('pt-BR') : '-';

  const fullAddress = [
    influencer.address_street,
    influencer.address_number,
    influencer.address_complement,
    influencer.address_neighborhood,
    `${influencer.address_city} - ${influencer.address_state}`,
    influencer.address_zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={influencer.profile_photo_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {getInitials(influencer.full_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">{influencer.full_name}</h3>
          <p className="text-muted-foreground text-sm">{influencer.email}</p>
          <Badge
            variant={influencer.status === 'active' ? 'default' : 'secondary'}
            className={
              influencer.status === 'active'
                ? 'bg-success/20 text-success hover:bg-success/30 mt-1'
                : 'mt-1'
            }
          >
            {influencer.status === 'active' ? 'Ativo' : 'Encerrado'}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Dados Pessoais */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Dados Pessoais</h4>
        <div className="grid gap-2">
          <DetailRow label="CPF" value={influencer.cpf} />
          <DetailRow label="Telefone" value={influencer.phone} />
          <DetailRow label="Instagram" value={influencer.instagram} />
          <DetailRow label="Chave PIX" value={influencer.pix_key} />
          <DetailRow label="Preferência de cupom" value={influencer.coupon_preference} />
        </div>
      </div>

      <Separator />

      {/* Informações Profissionais */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Informações Profissionais</h4>
        <div className="grid gap-2">
          <DetailRow label="É médico(a)" value={influencer.is_doctor ? 'Sim' : 'Não'} />
          {influencer.is_doctor && (
            <>
              <DetailRow label="Universidade" value={influencer.university} />
              <DetailRow label="Período" value={influencer.period} />
              <DetailRow
                label="Anos como médico(a)"
                value={influencer.years_as_medic?.toString()}
              />
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Endereço */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Endereço</h4>
        <p className="text-sm">{fullAddress}</p>
      </div>

      <Separator />

      {/* Parceria */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Informações da Parceria</h4>
        <div className="grid gap-2">
          <DetailRow
            label="Cupom gerado"
            value={
              influencer.generated_coupon ? (
                <code className="rounded bg-muted px-2 py-0.5 text-primary font-semibold">
                  {influencer.generated_coupon}
                </code>
              ) : null
            }
          />
          <DetailRow
            label="Link de divulgação"
            value={
              influencer.referral_link ? (
                <a
                  href={influencer.referral_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-info hover:underline break-all"
                >
                  {influencer.referral_link}
                </a>
              ) : null
            }
          />
          <DetailRow label="Início da parceria" value={formatDate(influencer.partnership_start_date)} />
          <DetailRow label="Término da parceria" value={formatDate(influencer.partnership_end_date)} />
          <DetailRow
            label="Datas de postagem"
            value={
              influencer.posting_dates?.length
                ? `Dia ${influencer.posting_dates.join(' e ')} de cada mês`
                : null
            }
          />
          <DetailRow
            label="Contrato"
            value={
              influencer.contract_url ? (
                <a
                  href={influencer.contract_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-info hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Ver contrato
                </a>
              ) : null
            }
          />
        </div>
      </div>

      <Separator />

      {/* Datas do sistema */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Informações do Sistema</h4>
        <div className="grid gap-2">
          <DetailRow label="Cadastrado em" value={formatDate(influencer.created_at)} />
          <DetailRow label="Última atualização" value={formatDate(influencer.updated_at)} />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button
          onClick={() => {
            onClose();
            onEdit(influencer);
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>
    </div>
  );
}
