import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProspectCard, ProspectStatus } from '@/types/prospect';
import {
  STATUS_LABELS, PIPELINE_LABELS, COLUMNS_ORDER,
  SIZE_CATEGORIES, extractInstagramHandle,
} from '@/types/prospect';

const BRAND_DARK = [25, 25, 30] as const;       // dark bg
const BRAND_RED = [200, 30, 40] as const;        // accent red
const BRAND_LIGHT_BG = [245, 245, 248] as const;
const WHITE = [255, 255, 255] as const;
const TEXT_DARK = [30, 30, 35] as const;
const TEXT_MUTED = [120, 120, 130] as const;

function fmt(n: number) { return n.toLocaleString('pt-BR'); }

function fmtDate(d: string | null): string {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
}

export function exportProspectsPdf(cards: ProspectCard[]) {
  if (cards.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const now = new Date();

  // ── Header on every page ──
  const drawHeader = () => {
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, 0, pageW, 26, 'F');

    // Red accent line
    doc.setFillColor(...BRAND_RED);
    doc.rect(0, 26, pageW, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...WHITE);
    doc.text('LIBERDADE MÉDICA EDUCAÇÃO', margin, 11);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório de Prospecção — Influenciadores', margin, 18);

    const rightX = pageW - margin;
    doc.setFontSize(7.5);
    doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, rightX, 10, { align: 'right' });
    doc.text(`Total de perfis: ${cards.length}`, rightX, 15, { align: 'right' });

    // Pipeline types present
    const types = [...new Set(cards.map(c => PIPELINE_LABELS[c.pipeline_type]))];
    if (types.length === 1) {
      doc.text(`Produto: ${types[0]}`, rightX, 20, { align: 'right' });
    }
  };

  const drawFooter = (pageNum: number, total: number) => {
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Liberdade Médica Educação — Relatório Confidencial', margin, pageH - 5);
    doc.text(`Página ${pageNum} de ${total}`, pageW - margin, pageH - 5, { align: 'right' });
  };

  // ══════════════════════════════════
  // PAGE 1 — Resumo Executivo
  // ══════════════════════════════════
  drawHeader();
  let y = 34;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_RED);
  doc.text('RESUMO EXECUTIVO', margin, y);
  y += 8;

  // Status counts
  const statusCounts: Record<ProspectStatus, number> = {
    contato_inicial: 0,
    em_negociacao: 0,
    aguardando_retorno: 0,
    aprovada_confirmada: 0,
    nao_prosseguir: 0,
  };
  cards.forEach(c => { statusCounts[c.status]++; });

  // KPI cards row 1: status
  const kpis = [
    { label: 'Total em Prospecção', value: fmt(cards.length) },
    ...COLUMNS_ORDER.map(s => ({ label: STATUS_LABELS[s], value: fmt(statusCounts[s]) })),
  ];

  const cardW = (pageW - margin * 2 - 8 * (kpis.length - 1)) / kpis.length;
  const cardH = 20;

  kpis.forEach((kpi, i) => {
    const cx = margin + i * (cardW + 8);
    // Dark card style
    doc.setFillColor(...BRAND_DARK);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(kpi.label, cx + 4, y + 7, { maxWidth: cardW - 8 });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(kpi.value, cx + 4, y + 16);
  });

  y += cardH + 10;

  // Size category distribution
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text('Distribuição por Categoria de Tamanho', margin, y);
  y += 6;

  const sizeCounts: Record<string, number> = {};
  SIZE_CATEGORIES.forEach(s => { sizeCounts[s] = 0; });
  cards.forEach(c => { if (sizeCounts[c.size_category] !== undefined) sizeCounts[c.size_category]++; });

  const sizeCardW = (pageW - margin * 2 - 5 * 5) / 6;
  const sizeCardH = 18;

  SIZE_CATEGORIES.forEach((cat, i) => {
    const cx = margin + i * (sizeCardW + 5);
    doc.setFillColor(...BRAND_LIGHT_BG);
    doc.roundedRect(cx, y, sizeCardW, sizeCardH, 2, 2, 'F');

    // Red top accent
    doc.setFillColor(...BRAND_RED);
    doc.rect(cx, y, sizeCardW, 1.5, 'F');

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(cat, cx + 3, y + 7, { maxWidth: sizeCardW - 6 });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_DARK);
    doc.text(fmt(sizeCounts[cat]), cx + 3, y + 15);
  });

  y += sizeCardH + 10;

  // Pipeline type distribution
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text('Distribuição por Produto', margin, y);
  y += 6;

  const pipelineCounts: Record<string, number> = {};
  cards.forEach(c => { pipelineCounts[c.pipeline_type] = (pipelineCounts[c.pipeline_type] || 0) + 1; });

  Object.entries(pipelineCounts).forEach(([key, count], i) => {
    const cx = margin + i * (120 + 8);
    doc.setFillColor(...BRAND_LIGHT_BG);
    doc.roundedRect(cx, y, 120, 14, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(PIPELINE_LABELS[key as keyof typeof PIPELINE_LABELS] || key, cx + 4, y + 6);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_DARK);
    doc.text(fmt(count), cx + 4, y + 12);
  });

  // ══════════════════════════════════
  // PAGE 2 — Pipeline Kanban View
  // ══════════════════════════════════
  doc.addPage();
  drawHeader();
  y = 34;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_RED);
  doc.text('PIPELINE DE PROSPECÇÃO', margin, y);
  y += 8;

  const colW = (pageW - margin * 2 - 4 * 4) / 5;

  // Column headers
  COLUMNS_ORDER.forEach((status, i) => {
    const cx = margin + i * (colW + 4);

    doc.setFillColor(...BRAND_DARK);
    doc.roundedRect(cx, y, colW, 10, 1.5, 1.5, 'F');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text(`${STATUS_LABELS[status]} (${statusCounts[status]})`, cx + 3, y + 6.5, { maxWidth: colW - 6 });
  });

  y += 13;

  // List cards in each column
  const maxCardsPerColumn = 12;
  const lineH = 5;

  COLUMNS_ORDER.forEach((status, i) => {
    const cx = margin + i * (colW + 4);
    const colCards = cards.filter(c => c.status === status).slice(0, maxCardsPerColumn);
    let cy = y;

    colCards.forEach((card) => {
      const handle = `@${extractInstagramHandle(card.instagram_url)}`;
      const line = card.name.substring(0, 18);

      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT_DARK);
      doc.text(line, cx + 2, cy);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_MUTED);
      doc.text(handle.substring(0, 20), cx + 2, cy + 3.5);

      const sizeLabel = card.size_category.split(' ')[0];
      doc.setFontSize(5);
      doc.text(`${sizeLabel} · ${card.state_uf || '—'}`, cx + 2, cy + 6.5);

      cy += lineH + 5;
    });

    if (statusCounts[status] > maxCardsPerColumn) {
      doc.setFontSize(5.5);
      doc.setTextColor(...BRAND_RED);
      doc.text(`+${statusCounts[status] - maxCardsPerColumn} mais...`, cx + 2, cy);
    }
  });

  // ══════════════════════════════════
  // PAGE 3 — Tabela Detalhada
  // ══════════════════════════════════
  doc.addPage();
  drawHeader();
  y = 34;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_RED);
  doc.text('TABELA DETALHADA DE PROSPECÇÃO', margin, y);
  y += 6;

  // Sort by status order
  const statusOrder = Object.fromEntries(COLUMNS_ORDER.map((s, i) => [s, i]));
  const sorted = [...cards].sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

  const tableRows = sorted.map(c => [
    c.name,
    `@${extractInstagramHandle(c.instagram_url)}`,
    c.size_category.split('(')[0].trim(),
    c.niche,
    PIPELINE_LABELS[c.pipeline_type].replace('Formação Paciente Grave ', 'FPG '),
    c.state_uf || '—',
    c.city || '—',
    STATUS_LABELS[c.status].split('(')[0].trim(),
    fmtDate(c.date_first_contact),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [[
      'Nome', 'Instagram', 'Tamanho', 'Nicho', 'Produto',
      'UF', 'Cidade', 'Status', 'Entrada',
    ]],
    body: tableRows,
    headStyles: {
      fillColor: [...BRAND_DARK] as [number, number, number],
      textColor: [...WHITE] as [number, number, number],
      fontStyle: 'bold',
      fontSize: 7,
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [...TEXT_DARK] as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [...BRAND_LIGHT_BG] as [number, number, number],
    },
    styles: { cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 28 },
      4: { cellWidth: 28 },
    },
  });

  // ── Footers ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  doc.save(`prospeccao_${now.toISOString().substring(0, 10)}.pdf`);
}
