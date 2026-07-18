import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadLogoData } from "./logo";

export type ExportColumn = {
  header: string;
  key: string;
  width?: number; // relative weight
};

export type ExportRow = Record<string, string>;

export interface ExportPdfOptions {
  title: string;
  filters?: string[]; // e.g. ["Ordenado por: Vencimento", "Cidade: Castanhal"]
  columns: ExportColumn[];
  rows: ExportRow[];
  filename: string;
  observationsKey?: string; // column key that should get green highlight for "done" text
}

const DONE_PATTERNS = /(ok\b|atendid|conclu[íi]d|resolvid|finaliz)/i;

function formatGeneratedAt(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function exportListToPdf(opts: ExportPdfOptions): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 32;
  const topY = 36;

  // Header block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 42, 71); // navy-800
  doc.text(opts.title, marginX, topY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 100, 115);
  doc.text(`Gerado em: ${formatGeneratedAt()}`, marginX, topY + 16);

  const filterLine = (opts.filters ?? []).filter(Boolean).join("  |  ");
  if (filterLine) {
    doc.text(filterLine, marginX, topY + 30);
  }

  const startY = topY + (filterLine ? 46 : 32);

  if (opts.rows.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text("Nenhum registro encontrado.", marginX, startY + 20);
    savePdfWithPagination(doc, opts.title, pageWidth, marginX);
    doc.save(opts.filename);
    return;
  }

  const totalWeight = opts.columns.reduce((s, c) => s + (c.width ?? 1), 0);
  const usableWidth = pageWidth - marginX * 2;

  const columnStyles: Record<number, { cellWidth: number }> = {};
  opts.columns.forEach((c, i) => {
    columnStyles[i] = { cellWidth: ((c.width ?? 1) / totalWeight) * usableWidth };
  });

  const obsIndex = opts.observationsKey
    ? opts.columns.findIndex((c) => c.key === opts.observationsKey)
    : -1;

  autoTable(doc, {
    startY,
    margin: { left: marginX, right: marginX },
    head: [opts.columns.map((c) => c.header)],
    body: opts.rows.map((r) => opts.columns.map((c) => r[c.key] ?? "-")),
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 6,
      overflow: "linebreak",
      lineColor: [230, 233, 238],
      lineWidth: { top: 0.5, bottom: 0.5, left: 0, right: 0 },
      textColor: [40, 47, 60],
    },
    headStyles: {
      fillColor: [15, 42, 71],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      lineWidth: 0,
    },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    columnStyles,
    didParseCell: (data) => {
      if (
        data.section === "body" &&
        obsIndex >= 0 &&
        data.column.index === obsIndex &&
        typeof data.cell.raw === "string" &&
        DONE_PATTERNS.test(data.cell.raw)
      ) {
        data.cell.styles.textColor = [22, 163, 74];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  savePdfWithPagination(doc, opts.title, pageWidth, marginX);
  doc.save(opts.filename);
}

function savePdfWithPagination(doc: jsPDF, _title: string, pageWidth: number, marginX: number) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 100, 115);
    const label = `Página ${String(i).padStart(2, "0")} de ${String(total).padStart(2, "0")}`;
    const w = doc.getTextWidth(label);
    doc.text(label, pageWidth - marginX - w, 36);
  }
}
