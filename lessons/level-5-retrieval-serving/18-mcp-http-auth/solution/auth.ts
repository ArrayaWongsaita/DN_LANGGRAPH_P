import { createHash, timingSafeEqual } from "node:crypto";

export function parseBearer(header: string | null | undefined): string | null {
  if (!header) return null;
  const parts = header.trim().split(/\s+/);
  if (parts.length !== 2) return null;
  if (parts[0].toLowerCase() !== "bearer" || parts[1] === "") return null;
  return parts[1];
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export type AuthResult = { ok: true; client: string } | { ok: false; reason: string };

export function authenticate(header: string | null | undefined, tokens: Record<string, string>): AuthResult {
  const token = parseBearer(header);
  if (!token) return { ok: false, reason: "ไม่มี Bearer token" };
  let matched: string | null = null;
  for (const [client, expected] of Object.entries(tokens)) {
    if (safeEqual(token, expected) && matched === null) matched = client;
  }
  return matched !== null ? { ok: true, client: matched } : { ok: false, reason: "token ไม่ถูกต้อง" };
}

export function unauthorizedResponse(reason: string): Response {
  return new Response(JSON.stringify({ error: "unauthorized", reason }), {
    status: 401,
    headers: { "WWW-Authenticate": 'Bearer realm="mcp"', "content-type": "application/json" },
  });
}
