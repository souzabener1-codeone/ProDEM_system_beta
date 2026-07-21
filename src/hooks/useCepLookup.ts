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

interface LookupCepResponse {
  found: boolean;
  source?: "viacep" | "brasilapi";
  address?: AddressData;
  message?: string;
  error?: string;
}

// ============================================================
// Hook — chama o proxy interno /api/public/lookup-cep
// (ViaCEP + fallback BrasilAPI executados no servidor)
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
      const res = await fetch("/api/public/lookup-cep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep }),
      });

      if (currentRequestId !== requestId.current) return;

      const response = (await res.json().catch(() => null)) as LookupCepResponse | null;

      if (!res.ok || !response) {
        throw new Error(response?.error ?? `HTTP ${res.status}`);
      }

      if (!response.found || !response.address) {
        setStatus("not_found");
        setData(null);
        setErrorMessage("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }

      setData(response.address);
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
