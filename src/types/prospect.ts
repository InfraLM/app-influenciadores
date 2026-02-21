export type PipelineType = 'FPG_ONLINE' | 'POS_GRAD';

export type ProspectStatus =
  | 'contato_inicial'
  | 'em_negociacao'
  | 'aguardando_retorno'
  | 'aprovada_confirmada'
  | 'nao_prosseguir';

export type RejectionReason =
  | 'nao_alinhamento_valores'
  | 'exclusividade_outra_empresa'
  | 'publico_nao_qualificado'
  | 'nao_respondeu'
  | 'nao_teve_interesse'
  | 'outro';

export const PIPELINE_LABELS: Record<PipelineType, string> = {
  FPG_ONLINE: 'Formação Paciente Grave Online',
  POS_GRAD: 'Pós-Graduação',
};

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  contato_inicial: 'Contato Inicial (Instagram)',
  em_negociacao: 'Em Negociação (WhatsApp)',
  aguardando_retorno: 'Aguardando Retorno',
  aprovada_confirmada: 'Aprovada / Confirmada',
  nao_prosseguir: 'Não Prosseguir',
};

export const COLUMNS_ORDER: ProspectStatus[] = [
  'contato_inicial',
  'em_negociacao',
  'aguardando_retorno',
  'aprovada_confirmada',
  'nao_prosseguir',
];

export const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
  nao_alinhamento_valores: 'Não alinhamento de valores',
  exclusividade_outra_empresa: 'Exclusividade com outra empresa',
  publico_nao_qualificado: 'Público não qualificado',
  nao_respondeu: 'Não respondeu',
  nao_teve_interesse: 'Não teve interesse',
  outro: 'Outro',
};

export const SIZE_CATEGORIES = [
  'Micro (1K-5K)',
  'Pequeno (5K-10K)',
  'Médio (10K-25K)',
  'Grande (25K-100K)',
  'Gigante (100K-999K)',
  'Fenômeno (+1M)',
] as const;

export const BRAZILIAN_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
] as const;

export const STATUS_DATE_MAP: Partial<Record<ProspectStatus, string>> = {
  contato_inicial: 'date_first_contact',
  em_negociacao: 'date_negotiation_start',
  aguardando_retorno: 'date_awaiting_response',
  aprovada_confirmada: 'date_closed',
};

export const COLUMN_COLORS: Record<ProspectStatus, string> = {
  contato_inicial: 'border-t-blue-500',
  em_negociacao: 'border-t-yellow-500',
  aguardando_retorno: 'border-t-orange-500',
  aprovada_confirmada: 'border-t-emerald-500',
  nao_prosseguir: 'border-t-red-500',
};

export interface ProspectCard {
  id: string;
  pipeline_type: PipelineType;
  status: ProspectStatus;
  name: string;
  instagram_url: string;
  size_category: string;
  niche: string;
  state_uf: string | null;
  city: string | null;
  whatsapp: string | null;
  followers: number | null;
  rejection_reason: RejectionReason | null;
  rejection_notes: string | null;
  date_first_contact: string | null;
  date_negotiation_start: string | null;
  date_awaiting_response: string | null;
  date_closed: string | null;
  date_last_contact: string | null;
  converted_influencer_id: string | null;
  converted_from_pipeline_type: PipelineType | null;
  position: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ProspectComment {
  id: string;
  prospect_card_id: string;
  content: string;
  author_name: string;
  author_id: string;
  created_at: string;
}

export interface ReopenEntry {
  id: string;
  prospect_card_id: string;
  reopened_at: string;
  reopened_by: string;
}

export interface ProspectFilters {
  search: string;
  productTracks: PipelineType[];
  stateUf: string;
  sizeCategory: string;
  minFollowers: number | null;
  maxFollowers: number | null;
}

export const EMPTY_FILTERS: ProspectFilters = {
  search: '',
  productTracks: [],
  stateUf: '',
  sizeCategory: '',
  minFollowers: null,
  maxFollowers: null,
};

export function normalizeUrl(url: string): string {
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

export function extractInstagramHandle(url: string): string {
  return url
    .replace(/https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/$/, '') || url;
}

export function applyFilters(cards: ProspectCard[], filters: ProspectFilters): ProspectCard[] {
  return cards.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchInsta = c.instagram_url.toLowerCase().includes(q);
      if (!matchName && !matchInsta) return false;
    }
    if (filters.productTracks.length > 0 && !filters.productTracks.includes(c.pipeline_type)) {
      return false;
    }
    if (filters.stateUf && c.state_uf !== filters.stateUf) {
      return false;
    }
    if (filters.sizeCategory && c.size_category !== filters.sizeCategory) {
      return false;
    }
    if (filters.minFollowers != null && (c.followers == null || c.followers < filters.minFollowers)) {
      return false;
    }
    if (filters.maxFollowers != null && (c.followers == null || c.followers > filters.maxFollowers)) {
      return false;
    }
    return true;
  });
}
