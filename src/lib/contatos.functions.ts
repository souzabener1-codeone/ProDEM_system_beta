import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

export const listContatos = createServerFn({ method: "GET" }).handler(async () => {
  const { readSheet, ensureHeader } = await import("./google/sheets.server");
  await ensureHeader(SHEET, HEADER);
  const { rows } = await readSheet(SHEET);
  return rows.map(toContato);
});

export const createContato = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contatoInput.parse(d))
  .handler(async ({ data }) => {
    const { appendRow } = await import("./google/sheets.server");
    await appendRow(SHEET, HEADER, toRow(data));
    return { ok: true };
  });
