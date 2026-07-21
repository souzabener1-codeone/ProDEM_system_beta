import { createFileRoute } from "@tanstack/react-router";

// ============================================================
// Public API: proxy de busca de endereço por CEP
// ViaCEP como primária, BrasilAPI como fallback.
// Rodando no servidor para evitar bloqueios de CORS/rede no cliente.
// ============================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TIMEOUT_MS = 5000;

interface AddressData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
}

function sanitizeCep(rawCep: string): string {
  return rawCep.replace(/\D/g, "");
}

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function fetchViaCep(cep: string): Promise<AddressData | null> {
  const { signal, clear } = withTimeout(TIMEOUT_MS);
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
    if (!res.ok) throw new Error(`ViaCEP respondeu ${res.status}`);
    const json = (await res.json()) as {
      cep?: string;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      complemento?: string;
      erro?: boolean;
    };
    if (json.erro) return null;
    return {
      cep: json.cep ?? cep,
      logradouro: json.logradouro ?? "",
      bairro: json.bairro ?? "",
      cidade: json.localidade ?? "",
      uf: json.uf ?? "",
      complemento: json.complemento,
    };
  } finally {
    clear();
  }
}

async function fetchBrasilApi(cep: string): Promise<AddressData | null> {
  const { signal, clear } = withTimeout(TIMEOUT_MS);
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, { signal });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      cep?: string;
      street?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
    };
    return {
      cep: json.cep ?? cep,
      logradouro: json.street ?? "",
      bairro: json.neighborhood ?? "",
      cidade: json.city ?? "",
      uf: json.state ?? "",
    };
  } finally {
    clear();
  }
}

export const Route = createFileRoute("/api/public/lookup-cep")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as { cep?: string };
          const cep = sanitizeCep(body?.cep ?? "");

          if (cep.length !== 8) {
            return new Response(
              JSON.stringify({ error: "CEP inválido. Envie 8 dígitos." }),
              {
                status: 400,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
              },
            );
          }

          let address: AddressData | null = null;
          let source: "viacep" | "brasilapi" | null = null;

          try {
            address = await fetchViaCep(cep);
            if (address) source = "viacep";
          } catch {
            // ViaCEP falhou — tenta fallback
          }

          if (!address) {
            try {
              address = await fetchBrasilApi(cep);
              if (address) source = "brasilapi";
            } catch {
              // fallback também falhou
            }
          }

          if (!address) {
            return new Response(
              JSON.stringify({ found: false, message: "CEP não encontrado" }),
              {
                status: 200,
                headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
              },
            );
          }

          return new Response(JSON.stringify({ found: true, source, address }), {
            status: 200,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Erro em /api/public/lookup-cep:", err);
          return new Response(
            JSON.stringify({ error: "Erro interno ao buscar CEP" }),
            {
              status: 500,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
