import { z } from "zod";

export function makeTracingSchema() {
  return z.object({
    LANGSMITH_TRACING: z.string().optional(),
    LANGSMITH_API_KEY: z.string().optional(),
    LANGSMITH_PROJECT: z.string().optional(),
  });
}

export interface TracingStatus {
  enabled: boolean;
  project: string;
  reason: string;
}

export function readTracing(source: Record<string, string | undefined>): TracingStatus {
  const env = makeTracingSchema().parse(source);
  const project = env.LANGSMITH_PROJECT?.trim() || "default";
  const wants = env.LANGSMITH_TRACING === "true";
  const hasKey = (env.LANGSMITH_API_KEY ?? "").trim() !== "";
  if (!wants) return { enabled: false, project, reason: "ไม่ได้เปิด" };
  if (!hasKey) return { enabled: false, project, reason: "ขาด LANGSMITH_API_KEY" };
  return { enabled: true, project, reason: "เปิด" };
}

export function maskKey(key: string): string {
  return key.length <= 8 ? "***" : `${key.slice(0, 4)}...${key.slice(-2)}`;
}
