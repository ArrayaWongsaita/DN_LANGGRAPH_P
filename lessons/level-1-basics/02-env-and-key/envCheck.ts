import { z } from "zod";
import { todo } from "@src/todo";

// หลักคิด: ค่าจาก .env เป็น "ข้อมูลจากภายนอก" ใครจะพิมพ์ผิดก็ได้ ควรตรวจตั้งแต่เริ่มโปรแกรม
// แล้วบอกว่าผิดตรงไหนให้ชัด ดีกว่าปล่อยให้พังกลางทางด้วย error งง ๆ
// เครื่องมือตรวจที่เราใช้คือ zod (ดูกล่องแนะนำ zod ใน README)

// schema = คำอธิบายว่าข้อมูลที่ "ถูกต้อง" หน้าตาเป็นอย่างไร
export function buildSettingsSchema() {
  // 👉 ข้อ 1: คืน schema ที่เป็น object สองช่อง:
  //   LLM_PROVIDER: ต้องเป็น "groq" หรือ "ollama" เท่านั้น ถ้าไม่ได้ตั้งให้เป็น "groq"
  //   LLM_MODEL:    ข้อความ ตัดช่องว่างหัวท้าย ถ้าไม่ได้ตั้งให้เป็น "" (สตริงว่าง)
  // แนวทาง: z.object({
  //           LLM_PROVIDER: z.enum(["groq", "ollama"]).default("groq"),
  //           LLM_MODEL: z.string().trim().default(""),
  //         })
  return todo(1);
}

export type SettingsResult =
  | { ok: true; value: { LLM_PROVIDER: "groq" | "ollama"; LLM_MODEL: string } }
  | { ok: false; problems: string[] };

// ตรวจค่าตั้งต้น (provider/model) ของ env ที่ส่งเข้ามา (ในโปรแกรมจริงส่ง process.env)
export function checkSettings(env: Record<string, string | undefined>): SettingsResult {
  // 👉 ข้อ 2: ใช้ buildSettingsSchema().safeParse(env)
  //   safeParse ไม่ throw แต่คืน { success: true, data } หรือ { success: false, error }
  //   - สำเร็จ: คืน { ok: true, value: result.data }
  //   - ไม่สำเร็จ: คืน { ok: false, problems } โดย problems คือรายการข้อความ "ชื่อตัวแปร: เหตุผล"
  //     แนวทาง: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`)
  return todo(2);
}

export type KeyResult = { ok: true; key: string } | { ok: false; problem: string };

// ตรวจว่า API key ถูกตั้งไว้ (ไม่ว่าง) โดยไม่พิมพ์ค่า key ออกมา
export function checkKey(env: Record<string, string | undefined>, keyVar: string): KeyResult {
  // 👉 ข้อ 3: ใช้ z.string().trim().min(1).safeParse(env[keyVar])
  //   - สำเร็จ: คืน { ok: true, key: result.data }
  //   - ไม่สำเร็จ (ไม่มีตัวแปร/ว่าง/ช่องว่างล้วน): คืน { ok: false, problem: `ยังไม่ได้ตั้ง ${keyVar} ใน .env` }
  return todo(3);
}

// ซ่อน key ก่อนพิมพ์ลงจอ (ให้มาแล้ว) การพิมพ์ key เต็มเสี่ยงหลุดตอนแชร์หน้าจอ
export function maskKey(key: string): string {
  return (key.length < 4 ? "" : key.slice(0, 4)) + "...";
}
