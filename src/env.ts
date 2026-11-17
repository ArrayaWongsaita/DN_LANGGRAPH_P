import { z } from "zod";

// ================================================================
// ไฟล์นี้คือ "จุดเดียว" ที่อ่านและตรวจค่าจาก .env ทั้งโปรเจกต์
// ที่อื่นไม่ต้องแตะ process.env เอง แค่ import ไปใช้:
//
//   import { env } from "@src/env";
//   env.GROQ_API_KEY   // ค่าที่ตรวจแล้ว ชนิดข้อมูลแน่นอน
//
// ถ้าค่าใน .env ผิด จะได้ EnvError ที่บอกทุกข้อที่ผิดพร้อมกัน (ข้อความไทย) ไม่ใช่ error งง ๆ ทีหลัง
// การตรวจเกิดตอน "เข้าถึงค่าครั้งแรก" และจำผลไว้ (ไม่ใช่ตอน import) เพื่อให้บทเรียนที่ไม่ใช้ LLM
// ยังรันได้แม้ยังไม่ได้ตั้ง key
//
// เพิ่ม provider ใหม่: เพิ่มชื่อใน PROVIDER_KEY_VARS และ field ของ key ใน envSchema ด้านล่าง
// แล้วเพิ่มแถวในตาราง PROVIDERS ของ src/llm.ts
// ================================================================

// ชื่อ provider ที่ใช้ได้ -> ชื่อตัวแปรที่เก็บ API key ของ provider นั้น
export const PROVIDER_KEY_VARS = {
  groq: "GROQ_API_KEY",
  ollama: "OLLAMA_API_KEY",
  opencode: "OPENCODE_GO_KEY",
} as const;

export type ProviderName = keyof typeof PROVIDER_KEY_VARS;
const PROVIDER_NAMES = Object.keys(PROVIDER_KEY_VARS) as [ProviderName, ...ProviderName[]];

const OLLAMA_DEFAULT_URL = "https://ollama.com";
const MIN_KEY_LENGTH = 10;

// ค่าว่างหรือมีแต่ช่องว่าง = "ไม่ได้ตั้ง" (ให้ใช้ค่าเริ่มต้น)
const blankToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const envSchema = z
  .object({
    LLM_PROVIDER: z.preprocess(
      blankToUndefined,
      z
        .enum(PROVIDER_NAMES, { error: `ต้องเป็นหนึ่งใน: ${PROVIDER_NAMES.join(", ")}` })
        .default("groq"),
    ),
    LLM_MODEL: z.preprocess(blankToUndefined, z.string().trim().default("")),
    GROQ_API_KEY: z.string().trim().default(""),
    OLLAMA_API_KEY: z.string().trim().default(""),
    OPENCODE_GO_KEY: z.string().trim().default(""),
    DATABASE_URL: z.string().trim().default(""), // ใช้เฉพาะบท Postgres (4-24)
    OLLAMA_BASE_URL: z
      .string()
      .optional()
      .transform((v) => ((v ?? "").trim() || OLLAMA_DEFAULT_URL).replace(/\/+$/, ""))
      .refine((v) => !v.endsWith("/api"), {
        message: `ต้องเป็นโดเมนเปล่า ๆ เช่น ${OLLAMA_DEFAULT_URL} ห้ามต่อท้ายด้วย /api (ไม่งั้นจะเจอ error 404)`,
      }),
  })
  // key ที่ต้องมี ขึ้นกับ provider ที่เลือก (provider อื่นไม่ต้องมี key)
  .superRefine((value, ctx) => {
    const keyVar = PROVIDER_KEY_VARS[value.LLM_PROVIDER];
    if (value[keyVar].length < MIN_KEY_LENGTH) {
      ctx.addIssue({
        code: "custom",
        path: [keyVar],
        message: `ยังไม่ได้ตั้ง หรือสั้นเกินไป (ต้องมีอย่างน้อย ${MIN_KEY_LENGTH} ตัวอักษร) สร้าง API key แล้วใส่ใน .env (ดู .env.example)`,
      });
    }
  });

export type Env = z.output<typeof envSchema>;

export class EnvError extends Error {
  constructor(public readonly problems: string[]) {
    super(`ตั้งค่าใน .env ไม่ถูกต้อง:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "EnvError";
  }
}

/** ตรวจ source (ปกติคือ process.env) ตาม envSchema คืนค่าที่ตรวจแล้ว หรือ throw EnvError */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;
  throw new EnvError(result.error.issues.map((i) => `${i.path.join(".") || "(env)"}: ${i.message}`));
}

let loaded = false;
function loadDotEnv() {
  if (loaded) return;
  loaded = true;
  try {
    process.loadEnvFile(); // โหลด .env เข้า process.env (ไม่ทับตัวแปรที่ตั้งไว้แล้ว)
  } catch {
    // ไม่มีไฟล์ .env ก็ไม่เป็นไร อาจตั้งค่าไว้ใน environment แล้ว
  }
}

let cached: Env | undefined;

/** โหลด .env แล้วตรวจ process.env ครั้งแรกครั้งเดียว จากนั้นคืนผลที่จำไว้ */
export function getEnv(): Env {
  if (!cached) {
    loadDotEnv();
    cached = parseEnv(process.env);
  }
  return cached;
}

/** ล้างผลที่จำไว้ ใช้ใน test หลังเปลี่ยนค่า process.env */
export function resetEnv(): void {
  cached = undefined;
}

/** ใช้เหมือน object ธรรมดา: env.GROQ_API_KEY (ตรวจตอนเข้าถึงครั้งแรก) */
export const env: Env = new Proxy({} as Env, {
  get: (_target, prop) => getEnv()[prop as keyof Env],
  has: (_target, prop) => prop in getEnv(),
  ownKeys: () => Reflect.ownKeys(getEnv()),
  getOwnPropertyDescriptor: (_target, prop) => Object.getOwnPropertyDescriptor(getEnv(), prop),
});
