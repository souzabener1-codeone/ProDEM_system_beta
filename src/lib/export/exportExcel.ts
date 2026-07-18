import ExcelJS from "exceljs";
import type { ExportColumn, ExportRow } from "./exportPdf";
import { loadLogoData } from "./logo";

export interface ExportExcelOptions {
  title: string;
  filters?: string[];
  columns: ExportColumn[];
  rows: ExportRow[];
  filename: string;
  sheetName?: string;
  observationsKey?: string;
}

const DONE_PATTERNS = /(ok\b|atendid|conclu[íi]d|resolvid|finaliz)/i;

function formatGeneratedAt(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function exportListToExcel(opts: ExportExcelOptions): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PRODEM";
  wb.created = new Date();
  const ws = wb.addWorksheet(opts.sheetName ?? "Dados", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  const colCount = opts.columns.length;
  const lastColLetter = columnLetter(colCount);

  // Row 1 — title
  ws.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = ws.getCell("A1");
  titleCell.value = opts.title;
  titleCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FF0F2A47" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  ws.getRow(1).height = 22;

  // Row 2 — metadata
  ws.mergeCells(`A2:${lastColLetter}2`);
  const metaCell = ws.getCell("A2");
  const filterLine = (opts.filters ?? []).filter(Boolean).join("  |  ");
  metaCell.value = `Gerado em: ${formatGeneratedAt()}${filterLine ? `   |   ${filterLine}` : ""}`;
  metaCell.font = { name: "Calibri", size: 10, color: { argb: "FF5A6473" } };
  metaCell.alignment = { vertical: "middle", horizontal: "left" };

  // Row 3 empty
  ws.getRow(3).height = 6;

  // Row 4 — header
  const headerRow = ws.getRow(4);
  opts.columns.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = c.header;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F2A47" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: "FFE6E9EE" } } };
  });
  headerRow.height = 24;

  // Column widths
  opts.columns.forEach((c, i) => {
    const col = ws.getColumn(i + 1);
    const weight = c.width ?? 1;
    col.width = Math.min(60, Math.max(14, 14 * weight));
  });

  const obsIndex = opts.observationsKey
    ? opts.columns.findIndex((c) => c.key === opts.observationsKey)
    : -1;

  if (opts.rows.length === 0) {
    ws.mergeCells(`A5:${lastColLetter}5`);
    const empty = ws.getCell("A5");
    empty.value = "Nenhum registro encontrado.";
    empty.font = { italic: true, color: { argb: "FF7A8090" } };
    empty.alignment = { horizontal: "center", vertical: "middle" };
  } else {
    opts.rows.forEach((r, rIdx) => {
      const row = ws.getRow(5 + rIdx);
      opts.columns.forEach((c, cIdx) => {
        const cell = row.getCell(cIdx + 1);
        const value = r[c.key] ?? "-";
        cell.value = value;
        cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
        cell.font = { name: "Calibri", size: 10, color: { argb: "FF282F3C" } };
        cell.border = { bottom: { style: "hair", color: { argb: "FFE6E9EE" } } };
        if (rIdx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F4F6" },
          };
        }
        if (cIdx === obsIndex && typeof value === "string" && DONE_PATTERNS.test(value)) {
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF16A34A" } };
        }
      });
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function columnLetter(n: number): string {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
