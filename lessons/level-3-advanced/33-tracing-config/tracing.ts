import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-33  (ไม่ใช้ LLM)
// การ trace (บันทึกทุกก้าวของ agent ไปดูใน LangSmith) เปิดด้วย environment variable: บทนี้ฝึกอ่านและตรวจค่าตั้งนั้นอย่างปลอดภัย
// (คอร์สนี้ไม่ส่งข้อมูล trace ออกไปไหน และไม่ต้องมีบัญชี LangSmith)

const tracingSchema = z.object({
  LANGSMITH_TRACING: z.string().optional(),
  LANGSMITH_API_KEY: z.string().optional(),
  LANGSMITH_PROJECT: z.string().optional(),
});

interface TracingStatus {
  enabled: boolean;
  project: string;
  reason: string;
}

function readTracing(source: Record<string, string | undefined>): TracingStatus {
  const env = tracingSchema.parse(source);
  // 👉 ข้อ 1 enabled เป็นจริงก็ต่อเมื่อ LANGSMITH_TRACING เท่ากับ "true" และ LANGSMITH_API_KEY มีค่า (ไม่ว่าง)
  //        project = LANGSMITH_PROJECT ถ้าไม่มีใช้ "default"
  //        reason: เปิดอยู่ = "เปิด", ไม่ตั้ง TRACING = "ไม่ได้เปิด", เปิดแต่ไม่มี key = "ขาด LANGSMITH_API_KEY"
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const wanted = env.LANGSMITH_TRACING === "true";
  //   const hasKey = Boolean(env.LANGSMITH_API_KEY);
  //   return {
  //     enabled: wanted && hasKey,
  //     project: env.LANGSMITH_PROJECT ?? "default",
  //     reason: wanted ? (hasKey ? "เปิด" : "ขาด LANGSMITH_API_KEY") : "ไม่ได้เปิด",
  //   };
  return todo(1);
}

// ซ่อน key ก่อนแสดงผล (ให้แล้ว): ไม่เคยพิมพ์ key เต็มลง log
const maskKey = (key: string): string => (key.length <= 8 ? "***" : `${key.slice(0, 4)}...${key.slice(-2)}`);

const on = readTracing({ LANGSMITH_TRACING: "true", LANGSMITH_API_KEY: "lsv2_pt_abcdef123456", LANGSMITH_PROJECT: "course" });
const off = readTracing({});
const noKey = readTracing({ LANGSMITH_TRACING: "true" });
console.log({ on, off, noKey, masked: maskKey("lsv2_pt_abcdef123456") });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ตั้งครบ: เปิดอยู่ และใช้ชื่อโปรเจกต์ที่ตั้ง", on.enabled && on.project === "course" && on.reason === "เปิด");
check("ไม่ตั้งอะไรเลย: ไม่เปิด โปรเจกต์ default", !off.enabled && off.project === "default" && off.reason === "ไม่ได้เปิด");
check("เปิดแต่ไม่มี key: ไม่เปิด บอกเหตุผล", !noKey.enabled && noKey.reason === "ขาด LANGSMITH_API_KEY");
check("maskKey ซ่อนส่วนกลางของ key", maskKey("lsv2_pt_abcdef123456") === "lsv2...56" && maskKey("short") === "***");
