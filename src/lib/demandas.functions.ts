import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertActiveStaff } from "@/lib/access-control";

const SHEET = "Demandas";

/** Cabeçalhos exatamente como devem aparecer na planilha (visão do usuário). */
const HEADER = [
  "Título",
  "Categoria",
  "Contato",
  "Cidade",
  "Descrição",
  "Data Solicitação",
  "Vencimento",
  "Observações",
  "Prioridade",
  "Status",
  "Responsável",
] as const;

export type DemandaRow = Record<(typeof HEADER)[number], string>;

/** Tipo tipado usado pela UI (aliases em camelCase). */
export type Demanda = {
  titulo: string;
  categoria: string;
  contato: string;
  cidade: string;
  descricao: string;
  dataSolicitacao: string;
  vencimento: string;
  observacoes: string;
  prioridade: string;
  status: string;
};

function toDemanda(row: DemandaRow): Demanda {
  return {
    titulo: row["Título"] ?? "",
    categoria: row["Categoria"] ?? "",
    contato: row["Contato"] ?? "",
    cidade: row["Cidade"] ?? "",
    descricao: row["Descrição"] ?? "",
    dataSolicitacao: row["Data Solicitação"] ?? "",
    vencimento: row["Vencimento"] ?? "",
    observacoes: row["Observações"] ?? "",
    prioridade: row["Prioridade"] ?? "",
    status: row["Status"] ?? "",
  };
}


const demandaInput = z.object({
  titulo: z.string().min(1),
  categoria: z.string().default(""),
  contato: z.string().default(""),
  cidade: z.string().default(""),
  descricao: z.string().default(""),
  dataSolicitacao: z.string().default(""),
  vencimento: z.string().default(""),
  observacoes: z.string().default(""),
  prioridade: z.string().default(""),
  status: z.string().default(""),
  responsavel: z.string().default(""),
});

function buildRow(input: z.infer<typeof demandaInput>): DemandaRow {
  return {
    "Título": input.titulo,
    "Categoria": input.categoria,
    "Contato": input.contato,
    "Cidade": input.cidade,
    "Descrição": input.descricao,
    "Data Solicitação": input.dataSolicitacao,
    "Vencimento": input.vencimento,
    "Observações": input.observacoes,
    "Prioridade": input.prioridade,
    "Status": input.status,
    "Responsável": input.responsavel,
  };
}

export const listDemandas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertActiveStaff(context);
    const { readSheet, ensureHeader } = await import("./google/sheets.server");
    await ensureHeader(SHEET, HEADER as unknown as string[]);
    const { rows } = await readSheet(SHEET);
    return rows.map((r) => toDemanda(r as DemandaRow));
  });

export const createDemanda = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => demandaInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertActiveStaff(context);
    const { appendRow } = await import("./google/sheets.server");
    const row = buildRow(data);
    await appendRow(SHEET, HEADER as unknown as string[], row);

    // Sincronização opcional com o Google Calendar (best effort).
    if (data.vencimento || data.dataSolicitacao) {
      try {
        const { createEvent } = await import("./google/calendar.server");
        await createEvent({
          summary:
            data.status === "Concluída"
              ? `✅ ${data.titulo}`
              : data.titulo,
          description: [data.descricao, data.observacoes].filter(Boolean).join("\n\n"),
          date: data.vencimento || data.dataSolicitacao,
        });
      } catch (err) {
        console.error("Calendar sync failed:", err);
      }
    }

    return toDemanda(row);
  });
