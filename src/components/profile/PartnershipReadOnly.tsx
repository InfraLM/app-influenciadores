import { FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/integrations/supabase/types';

type Influencer = Tables<'influencers'>;

interface PartnershipReadOnlyProps {
  influencer: Influencer;
}

export function PartnershipReadOnly({ influencer }: PartnershipReadOnlyProps) {
  return (
    <div className="form-section">
      <h3 className="mb-4 font-semibold">Informações da Parceria (somente leitura)</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cupom Gerado</Label>
          <div className="rounded-lg border bg-muted/50 p-3">
            <code className="text-primary font-semibold">
              {influencer.generated_coupon || 'Não definido'}
            </code>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Link de Divulgação</Label>
          <div className="rounded-lg border bg-muted/50 p-3 truncate">
            {influencer.referral_link ? (
              <a
                href={influencer.referral_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-info hover:underline text-sm"
              >
                {influencer.referral_link}
              </a>
            ) : (
              'Não definido'
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Data de Início</Label>
          <div className="rounded-lg border bg-muted/50 p-3">
            {influencer.partnership_start_date
              ? new Date(influencer.partnership_start_date).toLocaleDateString('pt-BR')
              : 'Não definida'}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Data de Término</Label>
          <div className="rounded-lg border bg-muted/50 p-3">
            {influencer.partnership_end_date
              ? new Date(influencer.partnership_end_date).toLocaleDateString('pt-BR')
              : 'Não definida'}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Datas de Postagem</Label>
          <div className="rounded-lg border bg-muted/50 p-3">
            {influencer.posting_dates?.length
              ? `Dia ${influencer.posting_dates.join(' e ')} de cada mês`
              : 'Não definidas'}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Contrato</Label>
          <div className="rounded-lg border bg-muted/50 p-3">
            {influencer.contract_url ? (
              <a
                href={influencer.contract_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-info hover:underline"
              >
                <FileText className="h-4 w-4" />
                Ver contrato
              </a>
            ) : (
              'Não anexado'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
