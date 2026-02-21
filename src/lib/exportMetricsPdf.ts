import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ContentRow, EvalRow, InfluencerRow } from '@/hooks/useMetricsAnalysis';

interface ExportPdfParams {
  contents: ContentRow[];
  evaluations: EvalRow[];
  influencers: InfluencerRow[];
  periodLabel: string;
  productLabel: string;
  influencerLabel: string;
}

const BRAND_NAVY = [15, 32, 65] as const;   // #0F2041
const BRAND_BLUE = [30, 90, 180] as const;  // #1E5AB4
const BRAND_LIGHT = [240, 244, 248] as const;

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

export function exportMetricsPdf({
  contents, evaluations, influencers, periodLabel, productLabel, influencerLabel,
}: ExportPdfParams) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const now = new Date();

  // ── Helper: header band ──
  const drawHeader = () => {
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Liberdade Médica Educação', margin, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório de Métricas — Influenciadores', margin, 19);

    // Right side info
    doc.setFontSize(8);
    const rightX = pageW - margin;
    doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, rightX, 10, { align: 'right' });
    doc.text(`Período: ${periodLabel}`, rightX, 15, { align: 'right' });
    if (productLabel !== 'Todos os Produtos') doc.text(`Produto: ${productLabel}`, rightX, 20, { align: 'right' });
    if (influencerLabel !== 'Todos os Influenciadores') doc.text(`Influenciador: ${influencerLabel}`, rightX, 25, { align: 'right' });
  };

  // ── Helper: footer ──
  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(`Liberdade Médica Educação — Relatório Confidencial`, margin, pageH - 6);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' });
  };

  // ══════════════════════════════
  // PAGE 1: Executive Summary
  // ══════════════════════════════
  drawHeader();

  let y = 38;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_NAVY);
  doc.text('Resumo Executivo', margin, y);
  y += 10;

  // KPI cards
  const totalContents = contents.length;
  const totalReach = contents.reduce((s, c) => s + c.reach, 0);
  const totalInteractions = contents.reduce((s, c) => s + c.interactions, 0);
  const totalLeads = evaluations.reduce((s, e) => s + e.leads, 0);
  const totalSales = evaluations.reduce((s, e) => s + e.sales, 0);
  const feedCount = contents.filter((c) => c.type === 'feed').length;
  const storyCount = contents.filter((c) => c.type === 'story').length;

  const kpis = [
    { label: 'Influenciadores Analisados', value: fmt(influencers.length) },
    { label: 'Total de Postagens', value: fmt(totalContents) },
    { label: 'Visualizações (Alcance)', value: fmt(totalReach) },
    { label: 'Interações', value: fmt(totalInteractions) },
    { label: 'Leads', value: fmt(totalLeads) },
    { label: 'Vendas', value: fmt(totalSales) },
  ];

  const cardW = (pageW - margin * 2 - 10 * 2) / 3;
  const cardH = 22;

  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = margin + col * (cardW + 10);
    const cy = y + row * (cardH + 6);

    doc.setFillColor(...BRAND_LIGHT);
    doc.roundedRect(cx, cy, cardW, cardH, 3, 3, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.label, cx + 6, cy + 8);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_NAVY);
    doc.text(kpi.value, cx + 6, cy + 18);
  });

  y += 2 * (cardH + 6) + 10;

  // Distribution mini-info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Distribuição: Feed ${fmt(feedCount)} · Stories ${fmt(storyCount)}`, margin, y);

  // ══════════════════════════════
  // PAGE 2: Performance Table
  // ══════════════════════════════
  doc.addPage();
  drawHeader();

  let tableY = 36;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_NAVY);
  doc.text('Tabela de Performance por Influenciador', margin, tableY);
  tableY += 6;

  const tableRows = influencers.map((inf) => {
    const ic = contents.filter((c) => c.influencer_id === inf.id);
    const ie = evaluations.filter((e) => e.influencer_id === inf.id);
    const reach = ic.reduce((s, c) => s + c.reach, 0);
    const interactions = ic.reduce((s, c) => s + c.interactions, 0);
    const leads = ie.reduce((s, e) => s + e.leads, 0);
    const sales = ie.reduce((s, e) => s + e.sales, 0);
    const avgScore = ie.length > 0 ? (ie.reduce((s, e) => s + (e.total_score ?? 0), 0) / ie.length).toFixed(1) : '—';

    return [
      inf.full_name,
      String(ic.length),
      fmt(reach),
      ic.length > 0 ? fmt(Math.round(reach / ic.length)) : '—',
      fmt(interactions),
      ic.length > 0 ? fmt(Math.round(interactions / ic.length)) : '—',
      String(leads),
      String(sales),
      avgScore,
    ];
  });

  // Sort by contents desc
  tableRows.sort((a, b) => Number(b[1]) - Number(a[1]));

  autoTable(doc, {
    startY: tableY,
    margin: { left: margin, right: margin },
    head: [[
      'Influenciador', 'Posts', 'Alcance', 'Alcance Médio',
      'Interações', 'Inter. Média', 'Leads', 'Vendas', 'Pont. Média',
    ]],
    body: tableRows,
    headStyles: {
      fillColor: [15, 32, 65] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 40] as [number, number, number] },
    alternateRowStyles: { fillColor: [240, 244, 248] as [number, number, number] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { halign: 'center' },
    },
    styles: { cellPadding: 2.5 },
  });

  // ── Add footers ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  doc.save(`relatorio_metricas_${now.toISOString().substring(0, 10)}.pdf`);
}
