import type { ProspectCard } from '@/types/prospect';
import { STATUS_LABELS, REJECTION_REASON_LABELS, PIPELINE_LABELS } from '@/types/prospect';
import type { RejectionReason } from '@/types/prospect';

function formatDateCSV(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportProspectsCSV(cards: ProspectCard[]) {
  const headers = [
    'Nome', 'Instagram', 'Produto/Curso', 'Categoria', 'Nicho', 'Seguidores',
    'UF', 'Cidade', 'WhatsApp', 'Status',
    'Primeiro Contato', 'Início Negociação',
    'Aguardando Retorno', 'Fechamento', 'Último Contato',
    'Motivo Não Prosseguir', 'Obs. Rejeição',
  ];

  const rows = cards.map((c) => [
    c.name,
    c.instagram_url,
    PIPELINE_LABELS[c.pipeline_type],
    c.size_category,
    c.niche,
    c.followers != null ? String(c.followers) : '',
    c.state_uf || '',
    c.city || '',
    c.whatsapp || '',
    STATUS_LABELS[c.status],
    formatDateCSV(c.date_first_contact),
    formatDateCSV(c.date_negotiation_start),
    formatDateCSV(c.date_awaiting_response),
    formatDateCSV(c.date_closed),
    formatDateCSV(c.date_last_contact),
    c.rejection_reason ? (REJECTION_REASON_LABELS[c.rejection_reason as RejectionReason] || c.rejection_reason) : '',
    c.rejection_notes || '',
  ]);

  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prospeccao_${new Date().toISOString().substring(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
