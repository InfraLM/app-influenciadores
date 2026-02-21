import * as XLSX from 'xlsx';
import type { ContentRow, EvalRow, InfluencerRow } from '@/hooks/useMetricsAnalysis';

interface ExportExcelParams {
  contents: ContentRow[];
  evaluations: EvalRow[];
  influencers: InfluencerRow[];
}

export function exportMetricsExcel({ contents, evaluations, influencers }: ExportExcelParams) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Resumo Geral ──
  const summaryRows = influencers.map((inf) => {
    const ic = contents.filter((c) => c.influencer_id === inf.id);
    const ie = evaluations.filter((e) => e.influencer_id === inf.id);
    return {
      'Influenciador': inf.full_name,
      'Instagram': inf.instagram ? `@${inf.instagram}` : '',
      'Total de Postagens': ic.length,
      'Total de Visualizações': ic.reduce((s, c) => s + c.reach, 0),
      'Total de Interações': ic.reduce((s, c) => s + c.interactions, 0),
      'Total de Leads': ie.reduce((s, e) => s + e.leads, 0),
      'Total de Vendas': ie.reduce((s, e) => s + e.sales, 0),
      'Pontuação Média': ie.length > 0
        ? Number((ie.reduce((s, e) => s + (e.total_score ?? 0), 0) / ie.length).toFixed(1))
        : 0,
    };
  });
  const ws1 = XLSX.utils.json_to_sheet(summaryRows);
  ws1['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 16 }, { wch: 20 },
    { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo Geral');

  // ── Sheet 2: Conteúdos ──
  const contentRows = contents.map((c) => ({
    'Influenciador': c.influencer?.full_name || '',
    'Instagram': c.influencer?.instagram ? `@${c.influencer.instagram}` : '',
    'Tipo': c.type === 'feed' ? 'Feed' : c.type === 'story' ? 'Story' : c.type,
    'Data': c.post_date,
    'Visualizações': c.reach,
    'Interações': c.interactions,
    'Produto/Curso': c.product,
    'Mês/Ano': c.month_year,
    'Extra': c.is_extra ? 'Sim' : 'Não',
  }));
  const ws2 = XLSX.utils.json_to_sheet(contentRows);
  ws2['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 10 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 10 }, { wch: 6 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Conteúdos');

  // ── Sheet 3: Ranking & Performance ──
  const rankingRows = evaluations.map((e) => ({
    'Influenciador': e.influencer?.full_name || '',
    'Instagram': e.influencer?.instagram ? `@${e.influencer.instagram}` : '',
    'Mês/Ano': e.month_year,
    'Qualidade Conteúdo': Number(e.content_quality_score),
    'Vendas (Nota)': Number(e.sales_score),
    'Engajamento': Number(e.engagement_score),
    'Postura Parceiro': Number(e.partner_posture_score),
    'Bônus': Number(e.bonus_score),
    'Pontuação Total': e.total_score ?? 0,
    'Leads': e.leads,
    'Vendas': e.sales,
  }));
  const ws3 = XLSX.utils.json_to_sheet(rankingRows);
  ws3['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 10 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 10 },
    { wch: 16 }, { wch: 8 }, { wch: 8 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Ranking & Performance');

  XLSX.writeFile(wb, `metricas_influenciadores_${new Date().toISOString().substring(0, 10)}.xlsx`);
}
