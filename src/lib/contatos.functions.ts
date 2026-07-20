import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertActiveStaff } from "@/lib/access-control";

const SHEET = "Contatos";
const HEADER = ["Código", "Contato", "Tipo", "Telefone", "Localização"];

export type Contato = {
  id: string; // row index (planilha), usado apenas na UI
  codigo: string;
  nome: string;
  tipo: string;
  telefone: string;
  localizacao: string;
  // Compat com telas que ainda leem estes campos:
  contato: string;
};

const contatoInput = z.object({
  codigo: z.string().default(""),
  nome: z.string().min(1),
  tipo: z.string().default(""),
  telefone: z.string().default(""),
  localizacao: z.string().default(""),
});

function toRow(input: z.infer<typeof contatoInput>): Record<string, string> {
  return {
    "Código": input.codigo,
    "Contato": input.nome,
    "Tipo": input.tipo,
    "Telefone": input.telefone,
    "Localização": input.localizacao,
  };
}

function toContato(row: Record<string, string>, idx: number): Contato {
  return {
    id: String(idx + 2),
    codigo: row["Código"] ?? "",
    nome: row["Contato"] ?? "",
    tipo: row["Tipo"] ?? "",
    telefone: row["Telefone"] ?? "",
    localizacao: row["Localização"] ?? "",
    contato: JSON.stringify({ telefone: row["Telefone"] ?? "" }),
  };
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Detects the legacy header (id, codigo, nome, tipo, contato, localizacao, ...)
 * and rewrites the sheet in the new 5-column format. Idempotent: no-op when
 * the header already matches HEADER.
 */
async function migrateLegacyContatos(): Promise<void> {
  const { readSheet, overwriteSheet } = await import("./google/sheets.server");
  const { header, rows } = await readSheet(SHEET);
  const isLegacy =
    header.length > 0 &&
    header[0]?.toLowerCase() === "id" &&
    header.some((h) => h?.toLowerCase() === "codigo");
  if (!isLegacy) return;

  const migrated: Record<string, string>[] = rows.map((r) => {
    const contatoJson = safeParse<{ telefone?: string }>(r["contato"] ?? "", {});
    const locJson = safeParse<{ cidade?: string; estado?: string }>(
      r["localizacao"] ?? "",
      {},
    );
    const localizacao = [locJson.cidade, locJson.estado].filter(Boolean).join("/");
    return {
      "Código": r["codigo"] ?? "",
      "Contato": r["nome"] ?? "",
      "Tipo": r["tipo"] ?? "",
      "Telefone": contatoJson.telefone ?? "",
      "Localização": localizacao,
    };
  });

  await overwriteSheet(SHEET, HEADER, migrated);
}

export const listContatos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertActiveStaff(context);
    const { readSheet, ensureHeader } = await import("./google/sheets.server");
    await migrateLegacyContatos();
    await ensureHeader(SHEET, HEADER);
    const { rows } = await readSheet(SHEET);
    return rows.map(toContato);
  });


export const createContato = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => contatoInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertActiveStaff(context);
    const { appendRow } = await import("./google/sheets.server");
    await appendRow(SHEET, HEADER, toRow(data));
    return { ok: true };
  });
