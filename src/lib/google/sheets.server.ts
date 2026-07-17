import { getGoogleAccessToken } from "./google-auth.server";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function sheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not configured.");
  return id;
}

async function gfetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getGoogleAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets request failed [${res.status}] ${url}: ${body}`);
  }
  return res;
}

/** Read a full sheet as rows. Assumes first row is the header. */
export async function readSheet(sheetName: string): Promise<{
  header: string[];
  rows: Record<string, string>[];
  /** 1-based row number for each row (matches Google Sheets grid) */
  rowNumbers: number[];
}> {
  const range = `${sheetName}!A1:ZZ`;
  const res = await gfetch(
    `${SHEETS_BASE}/${sheetId()}/values/${encodeURIComponent(range)}`,
  );
  const data = (await res.json()) as { values?: string[][] };
  const values = data.values ?? [];
  if (values.length === 0) return { header: [], rows: [], rowNumbers: [] };
  const [header, ...body] = values;
  const rows = body.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
  const rowNumbers = body.map((_, i) => i + 2);
  return { header, rows, rowNumbers };
}

export async function appendRow(sheetName: string, header: string[], row: Record<string, string>) {
  const values = [header.map((h) => row[h] ?? "")];
  const range = `${sheetName}!A1`;
  await gfetch(
    `${SHEETS_BASE}/${sheetId()}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values }) },
  );
}

export async function updateRow(
  sheetName: string,
  header: string[],
  rowNumber: number,
  row: Record<string, string>,
) {
  const values = [header.map((h) => row[h] ?? "")];
  const range = `${sheetName}!A${rowNumber}:${columnLetter(header.length)}${rowNumber}`;
  await gfetch(
    `${SHEETS_BASE}/${sheetId()}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    { method: "PUT", body: JSON.stringify({ values }) },
  );
}

/** Look up the numeric sheetId for a tab name (needed for deleteDimension). */
export async function getSheetGridId(sheetName: string): Promise<number> {
  const res = await gfetch(`${SHEETS_BASE}/${sheetId()}?fields=sheets(properties(sheetId,title))`);
  const data = (await res.json()) as {
    sheets: { properties: { sheetId: number; title: string } }[];
  };
  const found = data.sheets.find((s) => s.properties.title === sheetName);
  if (!found) throw new Error(`Sheet tab "${sheetName}" not found.`);
  return found.properties.sheetId;
}

export async function deleteRow(sheetName: string, rowNumber: number) {
  const gridId = await getSheetGridId(sheetName);
  await gfetch(`${SHEETS_BASE}/${sheetId()}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: gridId,
              dimension: "ROWS",
              startIndex: rowNumber - 1,
              endIndex: rowNumber,
            },
          },
        },
      ],
    }),
  });
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

/** Find a row by matching a column value; returns the row + its grid row number. */
export function findRowById(
  rows: Record<string, string>[],
  rowNumbers: number[],
  id: string,
  idColumn = "id",
): { row: Record<string, string>; rowNumber: number } | null {
  const idx = rows.findIndex((r) => r[idColumn] === id);
  if (idx === -1) return null;
  return { row: rows[idx], rowNumber: rowNumbers[idx] };
}
