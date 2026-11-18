const KEY_VARS: Record<string, string> = { groq: "GROQ_API_KEY", ollama: "OLLAMA_API_KEY", opencode: "OPENCODE_GO_KEY" };
const MIN_KEY_LENGTH = 10;

export interface LiveStatus {
  enabled: boolean;
  reason: string;
}

export function liveStatus(env: Record<string, string | undefined>): LiveStatus {
  if (env.RUN_LIVE !== "1") return { enabled: false, reason: "ข้าม: ตั้ง RUN_LIVE=1 เพื่อเปิด" };
  const provider = env.LLM_PROVIDER || "groq";
  const keyVar = Object.hasOwn(KEY_VARS, provider) ? KEY_VARS[provider] : undefined;
  if (!keyVar) return { enabled: false, reason: `ข้าม: ไม่รู้จัก provider ${provider}` };
  if ((env[keyVar] ?? "").trim().length < MIN_KEY_LENGTH) return { enabled: false, reason: `ข้าม: ไม่มี ${keyVar}` };
  return { enabled: true, reason: `เปิด: ${provider}` };
}

export function normalize(text: string): string {
  return text.normalize("NFC").toLowerCase().replace(/[\s​-‍﻿]/g, "");
}

export function mentions(text: string, needles: string[], mode: "any" | "all" = "any"): boolean {
  const hay = normalize(text);
  const wanted = needles.map(normalize).filter((n) => n !== "");
  if (wanted.length === 0) return false;
  return mode === "all" ? wanted.every((n) => hay.includes(n)) : wanted.some((n) => hay.includes(n));
}

export type ErrorKind = "auth" | "rate-limit" | "transient" | "assertion";

export function classifyError(error: unknown): ErrorKind {
  const e = error as { status?: number; message?: string } | null;
  const status = typeof e?.status === "number" ? e.status : undefined;
  const message = String(e?.message ?? error ?? "");
  if (status === 401 || status === 403) return "auth";
  if (status === 429 || /rate.?limit|quota|too many requests/i.test(message)) return "rate-limit";
  if ((status !== undefined && status >= 500) || /ETIMEDOUT|ECONNRESET|fetch failed|timeout/i.test(message)) return "transient";
  return "assertion";
}

export async function eventually<T>(
  check: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 0;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await check();
    } catch (error) {
      if (classifyError(error) === "auth") throw error;
      last = error;
      if (i < attempts - 1 && delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error(`ล้มเหลวทั้ง ${attempts} ครั้ง: ${last instanceof Error ? last.message : String(last)}`);
}

export function createBudget(maxCalls: number) {
  let used = 0;
  return {
    get used() {
      return used;
    },
    spend() {
      if (used >= maxCalls) throw new Error(`เกินงบการเรียกจริง (${maxCalls} ครั้ง)`);
      used++;
    },
  };
}
