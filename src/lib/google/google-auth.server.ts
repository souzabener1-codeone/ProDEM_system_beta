import { SignJWT, importPKCS8 } from "jose";

type TokenCache = { token: string; expiresAt: number };
const cache = new Map<string, TokenCache>();

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar",
];

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  // Strip wrapping quotes if the value was pasted with them.
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  // If provided base64-encoded (no PEM headers), decode it.
  if (!key.includes("BEGIN") && /^[A-Za-z0-9+/=\s]+$/.test(key)) {
    try {
      const decoded = Buffer.from(key.replace(/\s+/g, ""), "base64").toString("utf8");
      if (decoded.includes("BEGIN")) key = decoded.trim();
    } catch {
      // fall through
    }
  }
  // Convert literal \n sequences and normalize line endings.
  key = key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // If the key is PKCS#1 ("BEGIN RSA PRIVATE KEY"), rewrap as PKCS#8 fails —
  // service account keys from Google are always PKCS#8. Surface a clear error.
  if (key.includes("BEGIN RSA PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY is in PKCS#1 format. Use the PKCS#8 key from the Google service-account JSON (starts with '-----BEGIN PRIVATE KEY-----').",
    );
  }
  if (!key.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY is malformed. Paste the full 'private_key' value from the service-account JSON, including the '-----BEGIN PRIVATE KEY-----' header and '-----END PRIVATE KEY-----' footer.",
    );
  }

  // Ensure header/footer are on their own lines and body is wrapped to 64 chars.
  const headerRe = /-----BEGIN PRIVATE KEY-----/;
  const footerRe = /-----END PRIVATE KEY-----/;
  const bodyMatch = key.match(
    /-----BEGIN PRIVATE KEY-----([\s\S]*?)-----END PRIVATE KEY-----/,
  );
  if (bodyMatch) {
    const body = bodyMatch[1].replace(/\s+/g, "");
    const wrapped = body.match(/.{1,64}/g)?.join("\n") ?? body;
    key = `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----\n`;
  } else {
    if (!headerRe.test(key) || !footerRe.test(key)) {
      throw new Error("GOOGLE_PRIVATE_KEY missing BEGIN/END markers.");
    }
  }
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
