import { todo } from "@src/todo";

const KEY_VARS: Record<string, string> = { groq: "GROQ_API_KEY", google: "GOOGLE_API_KEY", deepseek: "DEEPSEEK_API_KEY", opencode: "OPENCODE_GO_KEY" };
const MIN_KEY_LENGTH = 10;

export interface LiveStatus {
  enabled: boolean;
  reason: string; // อธิบายสถานะ (ห้ามมีค่าของ key)
}

export function liveStatus(env: Record<string, string | undefined>): LiveStatus {
  // 👉 ข้อ 1: ตรวจตามลำดับ:
  //   env.RUN_LIVE !== "1" → { enabled: false, reason: "ข้าม: ตั้ง RUN_LIVE=1 เพื่อเปิด" }
  //   provider = (env.LLM_PROVIDER || "groq") ไม่อยู่ใน KEY_VARS (ตรวจด้วย Object.hasOwn) → { enabled: false, reason: `ข้าม: ไม่รู้จัก provider ${provider}` }
  //   key ของ provider (ตัวแปรชื่อใน KEY_VARS) ยาวน้อยกว่า MIN_KEY_LENGTH หลัง trim → { enabled: false, reason: `ข้าม: ไม่มี ${ชื่อตัวแปร}` }
  //   ผ่านหมด → { enabled: true, reason: `เปิด: ${provider}` }
  return todo(1);
}

// ทำให้ข้อความเทียบกันได้ทนความต่างเล็กน้อย: ตัวพิมพ์เล็ก, ตัดช่องว่างและอักขระความกว้างศูนย์ทั้งหมด
export function normalize(text: string): string {
  // 👉 ข้อ 2: text.normalize("NFC").toLowerCase() แล้วลบ \s และ ​-‍ และ ﻿ ทั้งหมด
  return todo(2);
}

export function mentions(text: string, needles: string[], mode: "any" | "all" = "any"): boolean {
  // 👉 ข้อ 3: เทียบด้วย normalize ทั้งสองฝั่ง ("any" = มีอย่างน้อยหนึ่งคำ, "all" = มีครบทุกคำ) needles ว่างคืน false; needle ที่ว่างหลัง normalize ให้ข้าม
  return todo(3);
}

export type ErrorKind = "auth" | "rate-limit" | "transient" | "assertion";

export function classifyError(error: unknown): ErrorKind {
  // 👉 ข้อ 4: อ่าน status จาก (error as { status?: number }).status และข้อความ error:
  //   status 401/403 → "auth"; status 429 หรือข้อความตรง /rate.?limit|quota|too many requests/i → "rate-limit";
  //   status >= 500 หรือข้อความตรง /ETIMEDOUT|ECONNRESET|fetch failed|timeout/i → "transient"; นอกนั้น → "assertion" (ผลตรวจไม่ผ่านเกณฑ์)
  return todo(4);
}

export async function eventually<T>(
  check: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 0;
  // 👉 ข้อ 5: ลอง check() สูงสุด attempts ครั้ง สำเร็จคืนค่าทันที
  //   ถ้าล้มและ classifyError เป็น "auth" ให้ throw error เดิมทันที (ไม่ลองซ้ำ ไม่เผาโควตา)
  //   ล้มอย่างอื่นให้รอ delayMs แล้วลองใหม่ ครบแล้วยังล้ม → throw new Error(`ล้มเหลวทั้ง ${attempts} ครั้ง: ${ข้อความของครั้งสุดท้าย}`)
  return todo(5);
}

// งบจำนวนครั้งการเรียกของจริง (กันลูปรั่วเงิน)
export function createBudget(maxCalls: number) {
  let used = 0;
  return {
    get used() {
      return used;
    },
    spend() {
      // (ให้ไว้แล้ว) เกินงบแล้วโยน error ที่บอกชัดเจน
      if (used >= maxCalls) throw new Error(`เกินงบการเรียกจริง (${maxCalls} ครั้ง)`);
      used++;
    },
  };
}
