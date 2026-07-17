import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SHEET = "Contatos";
const HEADER = [
  "id",
  "codigo",
  "nome",
  "tipo",
  "contato",
  "localizacao",
  "criado_em",
  "atualizado_em",
];

export type Contato = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  contato: string;
  localizacao: string;
  criado_em: string;
  atualizado_em: string;
};

const contatoInput = z.object({
  codigo: z.string().default(""),
  nome: z.string().min(1),
  tipo: z.string().default(""),
  contato: z.string().default(""),
  localizacao: z.string().default(""),
});

export const listContatos = createServerFn({ method: "GET" }).handler(async () => {
  const { readSheet } = await import("./google/sheets.server");
  const { rows } = await readSheet(SHEET);
  return rows as unknown as Contato[];
});

export const createContato = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contatoInput.parse(d))
  .handler(async ({ data }) => {
    const { appendRow } = await import("./google/sheets.server");
    const now = new Date().toISOString();
    const row: Contato = {
      id: crypto.randomUUID(),
      codigo: data.codigo,
      nome: data.nome,
      tipo: data.tipo,
      contato: data.contato,
      localizacao: data.localizacao,
      criado_em: now,
      atualizado_em: now,
    };
    await appendRow(SHEET, HEADER, row as unknown as Record<string, string>);
    return row;
  });

export const updateContato = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    contatoInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { readSheet, updateRow, findRowById } = await import("./google/sheets.server");
    const { rows, rowNumbers } = await readSheet(SHEET);
    const found = findRowById(rows, rowNumbers, data.id);
    if (!found) throw new Error("Contato não encontrado.");
    const updated: Contato = {
      ...(found.row as unknown as Contato),
      codigo: data.codigo,
      nome: data.nome,
      tipo: data.tipo,
      contato: data.contato,
      localizacao: data.localizacao,
      atualizado_em: new Date().toISOString(),
    };
    await updateRow(SHEET, HEADER, found.rowNumber, updated as unknown as Record<string, string>);
    return updated;
  });

export const deleteContato = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { readSheet, deleteRow, findRowById } = await import("./google/sheets.server");

    // Guard: check for related demandas.
    const demandas = await readSheet("Demandas");
    const linked = demandas.rows.some((r) => r["contato_id"] === data.id);
    if (linked) {
      throw new Error("Existem demandas vinculadas a este contato. Exclua-as antes.");
    }

    const { rows, rowNumbers } = await readSheet(SHEET);
    const found = findRowById(rows, rowNumbers, data.id);
    if (!found) throw new Error("Contato não encontrado.");
    await deleteRow(SHEET, found.rowNumber);
    return { ok: true };
  });
