import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================
// Types
// ============================================================

export interface AddressData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemento?: string;
}

type CepLookupStatus = "idle" | "loading" | "success" | "not_found" | "error";

interface UseCepLookupResult {
  status: CepLookupStatus;
  data: AddressData | null;
  errorMessage: string | null;
  lookupCep: (rawCep: string) => void;
  reset: () => void;
}

// ============================================================
// Helpers
// ============================================================

function sanitizeCep(rawCep: string): string {
  return rawCep.replace(/\D/g, "");
}

function isValidCepLength(cep: string): boolean {
  return cep.length === 8;
}

const DEBOUNCE_MS = 400;
const REQUEST_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromViaCep(cep: string): Promise<AddressData | null> {
  const res = await fetchWithTimeout(`https://viacep.com.br/ws/${cep}/json/`, REQUEST_TIMEOUT_MS);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    erro?: boolean;
    cep?: string;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    complemento?: string;
  };
  if (data.erro) return null;
  return {
    cep: data.cep ?? cep,
    logradouro: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    uf: data.uf ?? "",
    complemento: data.complemento,
  };
}

async function fetchFromBrasilApi(cep: string): Promise<AddressData | null> {
  const res = await fetchWithTimeout(
    `https://brasilapi.com.br/api/cep/v2/${cep}`,
    REQUEST_TIMEOUT_MS,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  return {
    cep: data.cep ?? cep,
    logradouro: data.street ?? "",
    bairro: data.neighborhood ?? "",
    cidade: data.city ?? "",
    uf: data.state ?? "",
  };
}

// ============================================================
// Hook — ViaCEP with BrasilAPI fallback (client-side, CORS-safe)
// ============================================================

export function useCepLookup(): UseCepLookupResult {
  const [status, setStatus] = useState<CepLookupStatus>("idle");
  const [data, setData] = useState<AddressData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setErrorMessage(null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const performLookup = useCallback(async (cep: string) => {
    const currentRequestId = ++requestId.current;
    setStatus("loading");
    setErrorMessage(null);

    try {
      let address = await fetchFromViaCep(cep).catch(() => null);
      if (!address) {
        address = await fetchFromBrasilApi(cep).catch(() => null);
      }

      if (currentRequestId !== requestId.current) return;

      if (!address) {
        setStatus("not_found");
        setData(null);
        setErrorMessage("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }

      setData(address);
      setStatus("success");
    } catch (err) {
      if (currentRequestId !== requestId.current) return;
      console.error("Erro ao buscar CEP:", err);
      setStatus("error");
      setData(null);
      setErrorMessage("Não foi possível buscar o CEP agora. Preencha o endereço manualmente.");
    }
  }, []);

  const lookupCep = useCallback(
    (rawCep: string) => {
      const cep = sanitizeCep(rawCep);

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!isValidCepLength(cep)) {
        if (status !== "idle") reset();
        return;
      }

      debounceTimer.current = setTimeout(() => {
        performLookup(cep);
      }, DEBOUNCE_MS);
    },
    [performLookup, reset, status],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return { status, data, errorMessage, lookupCep, reset };
}
