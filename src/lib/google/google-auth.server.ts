import { SignJWT, importPKCS8 } from "jose";

type TokenCache = { token: string; expiresAt: number };
const cache = new Map<string, TokenCache>();

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar",
];

function normalizePrivateKey(raw: string): string {
  // Accept keys with literal \n or with wrapping quotes.
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key;
}

export async function getGoogleAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !privateKeyRaw) {
    throw new Error("Google service account credentials are not configured.");
  }

  const cacheKey = email;
  const now = Math.floor(Date.now() / 1000);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt - 60 > now) {
    return cached.token;
  }

  const privateKey = await importPKCS8(normalizePrivateKey(privateKeyRaw), "RS256");

  const jwt = await new SignJWT({ scope: SCOPES.join(" ") })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(email)
    .setSubject(email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed [${res.status}]: ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cache.set(cacheKey, {
    token: data.access_token,
    expiresAt: now + data.expires_in,
  });
  return data.access_token;
}
