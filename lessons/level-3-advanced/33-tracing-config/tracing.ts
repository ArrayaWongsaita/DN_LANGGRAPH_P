import { z } from "zod";
import { todo } from "@src/todo";

export function makeTracingSchema() {
  // 👉 ข้อ 1: คืน z.object({ LANGSMITH_TRACING: z.string().optional(), LANGSMITH_API_KEY: z.string().optional(),
  //                          LANGSMITH_PROJECT: z.string().optional() })
  return todo(1);
}

export interface TracingStatus {
  enabled: boolean;
  project: string;
  reason: string;
}

export function readTracing(source: Record<string, string | undefined>): TracingStatus {
  const env = makeTracingSchema().parse(source);
  // 👉 ข้อ 2: enabled เป็นจริงก็ต่อเมื่อ LANGSMITH_TRACING เท่ากับ "true" และ LANGSMITH_API_KEY มีค่า (ไม่ว่าง)
  //          project = LANGSMITH_PROJECT ถ้าไม่มีใช้ "default"
  //          reason: เปิดอยู่ = "เปิด", ไม่ตั้ง TRACING = "ไม่ได้เปิด", เปิดแต่ไม่มี key = "ขาด LANGSMITH_API_KEY"
  return todo(2);
}

export function maskKey(key: string): string {
  return key.length <= 8 ? "***" : `${key.slice(0, 4)}...${key.slice(-2)}`;
}
