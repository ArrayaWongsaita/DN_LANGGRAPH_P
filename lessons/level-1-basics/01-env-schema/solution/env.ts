import { z } from "zod";

// รันด้วย: pnpm lesson 01
// ไฟล์นี้ตรวจค่าใน .env แล้ว export ออกไปชื่อ env ให้บทอื่นใช้ (บท 02 เป็นต้นไป)

// 1) โหลดไฟล์ .env เข้า process.env (ถ้าไม่มีไฟล์ก็ข้ามไป)
try {
  process.loadEnvFile();
} catch {
  // ไม่มี .env ก็ไม่เป็นไร ถ้าตั้งค่าไว้ใน environment แล้ว
}

// 2) schema = คำอธิบายว่าค่าที่ "ถูกต้อง" หน้าตาเป็นอย่างไร (ดูกล่องแนะนำ zod ใน README)
const envSchema = z.object({
  // key ของแต่ละเจ้า: ข้อความ ตัดช่องว่างหัวท้าย ถ้าไม่ตั้งให้เป็น "" (ให้มาแล้ว)
  GROQ_API_KEY: z.string().trim().default(""),
  GOOGLE_API_KEY: z.string().trim().default(""),
  DEEPSEEK_API_KEY: z.string().trim().default(""),
  OPENCODE_GO_KEY: z.string().trim().default(""),

  // ข้อ 1: LLM_MODEL = ชื่อโมเดล เป็นข้อความ ตัดช่องว่างหัวท้าย ถ้าไม่ตั้งให้เป็น ""
  LLM_MODEL: z.string().trim().default(""),
});

// 3) ตรวจ process.env ด้วย schema
// ข้อ 2: safeParse ไม่ throw แต่คืน { success: true, data } หรือ { success: false, error }
const result = envSchema.safeParse(process.env);

// 4) ถ้าค่าผิด ให้หยุดทันทีพร้อมบอกว่าตัวแปรไหนผิดเพราะอะไร (fail fast)
if (!result.success) {
  const problems = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
  throw new Error(`ตั้งค่าใน .env ไม่ถูกต้อง:\n${problems.join("\n")}`);
}

// 5) ต้องมี key อย่างน้อยหนึ่งเจ้า ไม่งั้นบทต่อไปเรียก LLM ไม่ได้ (ให้มาแล้ว)
const { GROQ_API_KEY, GOOGLE_API_KEY, DEEPSEEK_API_KEY, OPENCODE_GO_KEY } = result.data;
if (!GROQ_API_KEY && !GOOGLE_API_KEY && !DEEPSEEK_API_KEY && !OPENCODE_GO_KEY) {
  throw new Error("ยังไม่ได้ตั้ง API key ใน .env (ใส่อย่างน้อยหนึ่งอย่าง: GROQ_API_KEY, GOOGLE_API_KEY, DEEPSEEK_API_KEY หรือ OPENCODE_GO_KEY)");
}

// 6) ส่งค่าที่ตรวจแล้วออกไปให้ไฟล์อื่น: import { env } from "..."
export const env = result.data;

// ───────── ส่วนดูผล (ทำงานเฉพาะตอนรันไฟล์นี้ตรง ๆ ไม่ต้องแก้) ─────────
if (import.meta.filename === process.argv[1]) {
  const show = (key: string) => (key ? `พบแล้ว (${key.slice(0, 4)}...)` : "ยังไม่ได้ตั้ง");
  console.log("LLM_MODEL:       ", env.LLM_MODEL || "(ใช้ค่าเริ่มต้นของแต่ละเจ้า)");
  console.log("GROQ_API_KEY:    ", show(env.GROQ_API_KEY));
  console.log("GOOGLE_API_KEY:  ", show(env.GOOGLE_API_KEY));
  console.log("DEEPSEEK_API_KEY:", show(env.DEEPSEEK_API_KEY));
  console.log("OPENCODE_GO_KEY: ", show(env.OPENCODE_GO_KEY));
  console.log("✅ ผ่าน: ค่าใน .env ถูกต้อง (ลองลบ key ทุกตัวออกจาก .env ดูว่าได้ข้อความอะไร แล้วใส่คืน)");
}
