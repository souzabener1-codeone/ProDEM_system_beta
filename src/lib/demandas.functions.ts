import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SHEET = "Demandas";
const HEADER = [
  "id",
  "titulo",
  "descricao",
  "tipo",
  "contato_id",
  "responsavel",
  "data_criacao",
  "prazo",
  "prioridade",
  "status",
  "google_event_id",
];

const tipoEnum = z.enum(["Atendimento", "Ofício"]);
const prioridadeEnum = z.enum(["Baixa", "Média", "Alta"]);
const statusEnum = z.enum(["Não atendido", "Em andamento", "Em progresso", "Concluída"]);

export type Demanda = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "Atendimento" | "Ofício";
  contato_id: string;
  responsavel: string;
  data_criacao: string;
  prazo: string;
  prioridade: "Baixa" | "Média" | "Alta";
  status: "Não atendido" | "Em andamento" | "Em progresso" | "Concluída";
  google_event_id: string;
};

const demandaInput = z.object({
  titulo: z.string().min(1),
  descricao: z.string().default(""),
  tipo: tipoEnum,
  contato_id: z.string().default(""),
  responsavel: z.string().default(""),
  prazo: z.string().default(""), // ISO date or ""
  prioridade: prioridadeEnum,
  status: statusEnum,
});

function eventSummary(d: Pick<Demanda, "titulo" | "tipo" | "status">): string {
  const base = `[${d.tipo}] ${d.titulo}`;
  return d.status === "Concluída" ? `✅ ${base}` : base;
}

async function syncCalendar(
  prev: Demanda | null,
  next: Demanda,
): Promise<string> {
  const cal = await import("./google/calendar.server");
  const hadEvent = !!prev?.google_event_id;
  const wantsEvent = !!next.prazo;

  try {
    if (!wantsEvent && hadEvent) {
      await cal.deleteEvent(prev!.google_event_id);
      return "";
    }
    if (wantsEvent && !hadEvent) {
      return await cal.createEvent({
        summary: eventSummary(next),
        description: next.descricao,
        date: next.prazo,
      });
    }
    if (wantsEvent && hadEvent) {
      await cal.updateEvent(prev!.google_event_id, {
        summary: eventSummary(next),
        description: next.descricao,
        date: next.prazo,
      });
      return prev!.google_event_id;
    }
    return "";
  } catch (err) {
    console.error("Calendar sync failed:", err);
    // Sheet is source of truth; keep existing event id.
    return prev?.google_event_id ?? "";
  }
}

export const listDemandas = createServerFn({ method: "GET" }).handler(async () => {
  const { readSheet } = await import("./google/sheets.server");
  const { rows } = await readSheet(SHEET);
  return rows as unknown as Demanda[];
});

export const createDemanda = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => demandaInput.parse(d))
  .handler(async ({ data }) => {
    const { appendRow, readSheet, updateRow, findRowById } = await import(
      "./google/sheets.server"
    );

    const now = new Date().toISOString().slice(0, 10);
    const draft: Demanda = {
      id: crypto.randomUUID(),
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo,
      contato_id: data.contato_id,
      responsavel: data.responsavel,
      data_criacao: now,
      prazo: data.prazo,
      prioridade: data.prioridade,
      status: data.status,
      google_event_id: "",
    };
    await appendRow(SHEET, HEADER, draft as unknown as Record<string, string>);

    const eventId = await syncCalendar(null, draft);
    if (eventId) {
      const { rows, rowNumbers } = await readSheet(SHEET);
      const found = findRowById(rows, rowNumbers, draft.id);
      if (found) {
        const updated = { ...draft, google_event_id: eventId };
        await updateRow(SHEET, HEADER, found.rowNumber, updated as unknown as Record<string, string>);
        return updated;
      }
    }
    return draft;
  });

export const updateDemanda = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    demandaInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { readSheet, updateRow, findRowById } = await import("./google/sheets.server");
    const { rows, rowNumbers } = await readSheet(SHEET);
    const found = findRowById(rows, rowNumbers, data.id);
    if (!found) throw new Error("Demanda não encontrada.");
    const prev = found.row as unknown as Demanda;
    const next: Demanda = {
      ...prev,
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo,
      contato_id: data.contato_id,
      responsavel: data.responsavel,
      prazo: data.prazo,
      prioridade: data.prioridade,
      status: data.status,
    };
    const eventId = await syncCalendar(prev, next);
    next.google_event_id = eventId;
    await updateRow(SHEET, HEADER, found.rowNumber, next as unknown as Record<string, string>);
    return next;
  });

export const deleteDemanda = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { readSheet, deleteRow, findRowById } = await import("./google/sheets.server");
    const { rows, rowNumbers } = await readSheet(SHEET);
    const found = findRowById(rows, rowNumbers, data.id);
    if (!found) throw new Error("Demanda não encontrada.");
    const prev = found.row as unknown as Demanda;
    if (prev.google_event_id) {
      try {
        const { deleteEvent } = await import("./google/calendar.server");
        await deleteEvent(prev.google_event_id);
      } catch (err) {
        console.error("Calendar delete failed:", err);
      }
    }
    await deleteRow(SHEET, found.rowNumber);
    return { ok: true };
  });
