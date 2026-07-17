import { getGoogleAccessToken } from "./google-auth.server";

const CAL_BASE = "https://www.googleapis.com/calendar/v3";

function calendarId(): string {
  const id = process.env.GOOGLE_CALENDAR_ID;
  if (!id) throw new Error("GOOGLE_CALENDAR_ID is not configured.");
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
    throw new Error(`Calendar request failed [${res.status}] ${url}: ${body}`);
  }
  return res;
}

export type CalendarEventInput = {
  summary: string;
  description?: string;
  /** ISO date (YYYY-MM-DD) for all-day events */
  date: string;
  reminderMinutes?: number;
};

function buildBody(input: CalendarEventInput) {
  return {
    summary: input.summary,
    description: input.description ?? "",
    start: { date: input.date },
    end: { date: input.date },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: input.reminderMinutes ?? 1440 }],
    },
  };
}

export async function createEvent(input: CalendarEventInput): Promise<string> {
  const res = await gfetch(
    `${CAL_BASE}/calendars/${encodeURIComponent(calendarId())}/events`,
    { method: "POST", body: JSON.stringify(buildBody(input)) },
  );
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function updateEvent(eventId: string, input: CalendarEventInput): Promise<void> {
  await gfetch(
    `${CAL_BASE}/calendars/${encodeURIComponent(calendarId())}/events/${encodeURIComponent(eventId)}`,
    { method: "PATCH", body: JSON.stringify(buildBody(input)) },
  );
}

export async function deleteEvent(eventId: string): Promise<void> {
  const token = await getGoogleAccessToken();
  const res = await fetch(
    `${CAL_BASE}/calendars/${encodeURIComponent(calendarId())}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  // 410 = already deleted; treat as success.
  if (!res.ok && res.status !== 410 && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Calendar delete failed [${res.status}]: ${body}`);
  }
}
