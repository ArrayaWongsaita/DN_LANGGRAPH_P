import { z } from "zod";

export function buildSettingsSchema() {
  return z.object({
    LLM_PROVIDER: z.enum(["groq", "ollama"]).default("groq"),
    LLM_MODEL: z.string().trim().default(""),
  });
}

export type SettingsResult =
  | { ok: true; value: { LLM_PROVIDER: "groq" | "ollama"; LLM_MODEL: string } }
  | { ok: false; problems: string[] };

export function checkSettings(env: Record<string, string | undefined>): SettingsResult {
  const result = buildSettingsSchema().safeParse(env);
  if (result.success) return { ok: true, value: result.data };
  return { ok: false, problems: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
}

export type KeyResult = { ok: true; key: string } | { ok: false; problem: string };

export function checkKey(env: Record<string, string | undefined>, keyVar: string): KeyResult {
  const result = z.string().trim().min(1).safeParse(env[keyVar]);
  if (result.success) return { ok: true, key: result.data };
  return { ok: false, problem: `ยังไม่ได้ตั้ง ${keyVar} ใน .env` };
}

export function maskKey(key: string): string {
  return (key.length < 4 ? "" : key.slice(0, 4)) + "...";
}
