import { z } from "zod";
import { check } from "@src/check";

// รันด้วย pnpm lesson 1-01 จากโฟลเดอร์หลักของโปรเจกต์
try {
  process.loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const envSchema = z.object({
  LLM_MODEL: z.string().trim().default(""),
  GROQ_API_KEY: z.string().trim().default(""),
  GOOGLE_API_KEY: z.string().trim().default(""),
  DEEPSEEK_API_KEY: z.string().trim().default(""),
  OPENCODE_GO_KEY: z.string().trim().default(""),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  const problems = result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`);
  throw new Error(`ตั้งค่าใน .env ไม่ถูกต้อง\n${problems.join("\n")}`);
}

export const env = result.data;
const apiKeys = [env.GROQ_API_KEY, env.GOOGLE_API_KEY, env.DEEPSEEK_API_KEY, env.OPENCODE_GO_KEY];
const hasApiKey = apiKeys.some((key) => key.length > 0);
if (!hasApiKey) {
  throw new Error("ยังไม่ได้ตั้ง API key ใน .env เปิด .env.example เพื่อดูชื่อตัวแปรของโมเดลที่เลือก");
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
if (import.meta.filename === process.argv[1]) {
  console.log("LLM_MODEL", env.LLM_MODEL || "(ใช้โมเดลเริ่มต้น)");
  check("พบ API key อย่างน้อยหนึ่งตัว", hasApiKey);
  check("ตัดช่องว่างหัวท้ายของ LLM_MODEL แล้ว", env.LLM_MODEL === env.LLM_MODEL.trim());
}
