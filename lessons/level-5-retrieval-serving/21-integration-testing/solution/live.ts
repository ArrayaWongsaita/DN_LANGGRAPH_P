import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-21  (ส่วนเรียกโมเดลจริงทำงานเมื่อตั้ง RUN_LIVE=1 เท่านั้น เช่น RUN_LIVE=1 pnpm lesson 5-21)
// integration test กับโมเดลจริงต่างจาก test ด้วยโมเดลปลอม: ผลไม่นิ่ง (คำตอบเปลี่ยนถ้อยคำ), อาจชนโควตา/เครือข่ายล่ม, และเสียเงิน บทนี้เขียนเครื่องมือเล็ก ๆ ที่ทำให้มันใช้ได้จริง: สวิตช์เปิด/ข้าม (ไม่มี key ก็ไม่พัง), เทียบข้อความแบบทนความต่างเล็กน้อย, แยกชนิดข้อผิดพลาด, ลองซ้ำเฉพาะที่ควร และงบจำนวนครั้ง

const KEY_VARS: Record<string, string> = { groq: "GROQ_API_KEY", google: "GOOGLE_API_KEY", deepseek: "DEEPSEEK_API_KEY", opencode: "OPENCODE_GO_KEY" };
const MIN_KEY_LENGTH = 10;

interface LiveStatus {
  enabled: boolean;
  reason: string; // อธิบายสถานะ (ห้ามมีค่าของ key)
}

function liveStatus(env: Record<string, string | undefined>): LiveStatus {
  // ข้อ 1: ตรวจตามลำดับ:
  //   env.RUN_LIVE !== "1" → { enabled: false, reason: "ข้าม: ตั้ง RUN_LIVE=1 เพื่อเปิด" }
  //   provider = (env.LLM_PROVIDER || "groq") ไม่อยู่ใน KEY_VARS (ตรวจด้วย Object.hasOwn) → { enabled: false, reason: `ข้าม: ไม่รู้จัก provider ${provider}` }
  //   key ของ provider (ตัวแปรชื่อใน KEY_VARS) ยาวน้อยกว่า MIN_KEY_LENGTH หลัง trim → { enabled: false, reason: `ข้าม: ไม่มี ${ชื่อตัวแปร}` }
  //   ผ่านหมด → { enabled: true, reason: `เปิด: ${provider}` }
  if (env.RUN_LIVE !== "1") return { enabled: false, reason: "ข้าม: ตั้ง RUN_LIVE=1 เพื่อเปิด" };
  const provider = env.LLM_PROVIDER || "groq";
  if (!Object.hasOwn(KEY_VARS, provider)) return { enabled: false, reason: `ข้าม: ไม่รู้จัก provider ${provider}` };
  const keyVar = KEY_VARS[provider];
  if ((env[keyVar] ?? "").trim().length < MIN_KEY_LENGTH) return { enabled: false, reason: `ข้าม: ไม่มี ${keyVar}` };
  return { enabled: true, reason: `เปิด: ${provider}` };
}

// ทำให้ข้อความเทียบกันได้ทนความต่างเล็กน้อย: ตัวพิมพ์เล็ก, ตัดช่องว่างและอักขระความกว้างศูนย์ทั้งหมด
function normalize(text: string): string {
  // ข้อ 2: text.normalize("NFC").toLowerCase() แล้วลบ \s และ ​-‍ และ ﻿ ทั้งหมด
  return text.normalize("NFC").toLowerCase().replace(/[\s​-‍﻿]/g, "");
}

function mentions(text: string, needles: string[], mode: "any" | "all" = "any"): boolean {
  // ข้อ 3: เทียบด้วย normalize ทั้งสองฝั่ง ("any" = มีอย่างน้อยหนึ่งคำ, "all" = มีครบทุกคำ) needles ว่างคืน false; needle ที่ว่างหลัง normalize ให้ข้าม
  const haystack = normalize(text);
  const wanted = needles.map(normalize).filter((n) => n !== "");
  if (wanted.length === 0) return false;
  return mode === "all" ? wanted.every((n) => haystack.includes(n)) : wanted.some((n) => haystack.includes(n));
}

type ErrorKind = "auth" | "rate-limit" | "transient" | "assertion";

function classifyError(error: unknown): ErrorKind {
  // ข้อ 4: อ่าน status จาก (error as { status?: number }).status และข้อความ error:
  //   status 401/403 → "auth"; status 429 หรือข้อความตรง /rate.?limit|quota|too many requests/i → "rate-limit";
  //   status >= 500 หรือข้อความตรง /ETIMEDOUT|ECONNRESET|fetch failed|timeout/i → "transient"; นอกนั้น → "assertion" (ผลตรวจไม่ผ่านเกณฑ์)
  const status = (error as { status?: number } | null | undefined)?.status;
  const message = error instanceof Error ? error.message : "";
  if (status === 401 || status === 403) return "auth";
  if (status === 429 || /rate.?limit|quota|too many requests/i.test(message)) return "rate-limit";
  if ((typeof status === "number" && status >= 500) || /ETIMEDOUT|ECONNRESET|fetch failed|timeout/i.test(message)) return "transient";
  return "assertion";
}

async function eventually<T>(check: () => Promise<T>, options: { attempts?: number; delayMs?: number } = {}): Promise<T> {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 0;
  // ข้อ 5: ลอง check() สูงสุด attempts ครั้ง สำเร็จคืนค่าทันที
  //   ถ้าล้มและ classifyError เป็น "auth" ให้ throw error เดิมทันที (ไม่ลองซ้ำ ไม่เผาโควตา)
  //   ล้มอย่างอื่นให้รอ delayMs แล้วลองใหม่ (ไม่รอหลังครั้งสุดท้าย) ครบแล้วยังล้ม → throw new Error(`ล้มเหลวทั้ง ${attempts} ครั้ง: ${ข้อความของครั้งสุดท้าย}`)
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

// (ให้ไว้แล้ว) งบจำนวนครั้งการเรียกของจริง (กันลูปรั่วเงิน)
function createBudget(maxCalls: number) {
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

// ส่วนที่ 1: integration test กับโมเดลจริง (ข้ามถ้าไม่ได้ตั้ง RUN_LIVE=1) ที่นี่สถานะอ่านจาก .env
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
const status = liveStatus(process.env);
console.log("สถานะ:", status.reason);
const budget = createBudget(6);
let liveText = "";
let liveError = "";
if (status.enabled) {
  try {
    liveText = await eventually(
      async () => {
        budget.spend();
        const reply = (await llm.invoke("2 บวก 3 เท่ากับเท่าไร ตอบสั้น ๆ")).text;
        if (!mentions(reply, ["5", "ห้า", "five"])) throw new Error(`ไม่พบคำตอบ 5 ในข้อความ: ${reply.slice(0, 40)}`);
        return reply;
      },
      { attempts: 3, delayMs: 500 },
    );
    console.log("ผ่าน:", liveText.slice(0, 80), `(ใช้การเรียก ${budget.used} ครั้ง)`);
  } catch (error) {
    liveError = `${classifyError(error)}: ${(error as Error).message}`;
    console.log("ไม่ผ่าน:", liveError);
  }
}

// ส่วนที่ 2: ฟังก์ชันที่เขียน (ไม่เรียกโมเดล)
const KEY = "k".repeat(20);
const s = (code: number, message = "x") => Object.assign(new Error(message), { status: code });
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const rejects = async (p: Promise<unknown>): Promise<unknown> => {
  try {
    await p;
    return undefined;
  } catch (e) {
    return e;
  }
};
let n1 = 0;
const first = await eventually(async () => ++n1);
let n2 = 0;
const flaky = await eventually(async () => {
  if (++n2 < 3) throw new Error("ยังไม่ตรง");
  return "ผ่าน";
});
let n3 = 0;
const exhausted = (await rejects(eventually(async () => { throw new Error(`ผิดครั้งที่ ${++n3}`); }, { attempts: 4 }))) as Error;
let n4 = 0;
const authError = Object.assign(new Error("Invalid API key"), { status: 401 });
const authThrown = await rejects(eventually(async () => { n4++; throw authError; }));
const t0 = Date.now();
await rejects(eventually(async () => { throw new Error("x"); }, { attempts: 3, delayMs: 30 }));
const elapsed = Date.now() - t0;
let lastCall = 0;
await rejects(eventually(async () => { lastCall = Date.now(); throw new Error("x"); }, { attempts: 2, delayMs: 150 }));
const afterLast = Date.now() - lastCall;
const b = createBudget(2);
b.spend();
b.spend();
const overBudget = (() => {
  try {
    b.spend();
    return "";
  } catch (e) {
    return (e as Error).message;
  }
})();

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("liveStatus: ไม่ตั้ง RUN_LIVE=1 → ข้ามพร้อมเหตุผล (แม้มี key)", same(liveStatus({ GROQ_API_KEY: KEY }), { enabled: false, reason: "ข้าม: ตั้ง RUN_LIVE=1 เพื่อเปิด" }) && !liveStatus({ RUN_LIVE: "true", GROQ_API_KEY: KEY }).enabled && !liveStatus({ RUN_LIVE: "0", GROQ_API_KEY: KEY }).enabled);
check("liveStatus: provider เริ่มต้น groq ต้องมี GROQ_API_KEY ยาวพอ (ยาว 10 พอดีผ่าน)", same(liveStatus({ RUN_LIVE: "1" }), { enabled: false, reason: "ข้าม: ไม่มี GROQ_API_KEY" }) && !liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: "สั้น" }).enabled && !liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: `  ${"k".repeat(9)}  ` }).enabled && same(liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: KEY }), { enabled: true, reason: "เปิด: groq" }) && liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: "k".repeat(10) }).enabled);
check("liveStatus: ใช้ key ของ provider ที่เลือกเท่านั้น, LLM_PROVIDER ว่างใช้ groq, ไม่รู้จักก็ข้าม", same(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "opencode", OPENCODE_GO_KEY: KEY }), { enabled: true, reason: "เปิด: opencode" }) && same(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "opencode", GROQ_API_KEY: KEY }), { enabled: false, reason: "ข้าม: ไม่มี OPENCODE_GO_KEY" }) && liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "google", GOOGLE_API_KEY: KEY }).enabled && same(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "", GROQ_API_KEY: KEY }), { enabled: true, reason: "เปิด: groq" }) && same(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "ไม่มีจริง", GROQ_API_KEY: KEY }), { enabled: false, reason: "ข้าม: ไม่รู้จัก provider ไม่มีจริง" }) && same(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "toString", GROQ_API_KEY: KEY }), { enabled: false, reason: "ข้าม: ไม่รู้จัก provider toString" }), "ตรวจชื่อ provider ด้วย Object.hasOwn");
check("liveStatus: เหตุผลไม่เคยมีค่าของ key", [{ RUN_LIVE: "1", GROQ_API_KEY: KEY }, { RUN_LIVE: "1", GROQ_API_KEY: "short" }, { GROQ_API_KEY: KEY }].every((env) => !liveStatus(env).reason.includes(env.GROQ_API_KEY)));
check("normalize: ไม่สนตัวพิมพ์/ช่องว่าง/อักขระความกว้างศูนย์ (ทั้งช่วง) และ NFC", normalize("  คำ ตอบ  คือ 5\n") === "คำตอบคือ5" && normalize("ABC​def﻿") === "abcdef" && normalize("a‌b‍c") === "abc" && normalize("Café") === normalize("café"));
check("mentions: any/all และทนช่องว่างที่โมเดลเติมในภาษาไทย", mentions("ผลลัพธ์ คือ 5 ครับ", ["ผลลัพธ์คือ5"]) && mentions("The answer is FIVE", ["five", "5"]) && !mentions("answer 5", ["five", "6"]) && mentions("ก ข ค", ["ก", "ค"], "all") && !mentions("ก ข", ["ก", "ค"], "all") && mentions("Café เปิดแล้ว", ["café"]));
check("mentions: needles ว่าง หรือมีแต่สตริงว่าง ต้องไม่ผ่านโดยบังเอิญ", !mentions("อะไรก็ได้", []) && !mentions("อะไรก็ได้", [""]) && !mentions("อะไรก็ได้", [" ", ""], "all") && mentions("abc", ["", "abc"], "all"));
check("classifyError: จัดประเภทตามสถานะและข้อความ", classifyError(s(401)) === "auth" && classifyError(s(403)) === "auth" && classifyError(s(429)) === "rate-limit" && classifyError(new Error("Rate limit reached for model")) === "rate-limit" && classifyError(new Error("You exceeded your current quota")) === "rate-limit" && classifyError(s(503)) === "transient" && classifyError(s(500)) === "transient" && classifyError(new Error("read ECONNRESET")) === "transient" && classifyError(new TypeError("fetch failed")) === "transient" && classifyError(new Error("expected 5 to be 6")) === "assertion" && classifyError("string") === "assertion" && classifyError(undefined) === "assertion");
check("eventually: สำเร็จครั้งแรกเรียกครั้งเดียว; ผลหลุดเกณฑ์ครั้งคราวลองซ้ำจนผ่าน", first === 1 && n1 === 1 && flaky === "ผ่าน" && n2 === 3);
check("eventually: ครบจำนวนครั้งแล้วยังล้ม → error ที่บอกจำนวนครั้งและสาเหตุสุดท้าย", exhausted?.message === "ล้มเหลวทั้ง 4 ครั้ง: ผิดครั้งที่ 4" && n3 === 4);
check("eventually: ผิดสิทธิ์ (401/403) หยุดทันที ไม่เผาโควตา และโยน error เดิม", authThrown === authError && n4 === 1);
check("eventually: รอระหว่างครั้งตาม delayMs แต่ไม่รอหลังครั้งสุดท้าย", elapsed >= 55 && elapsed < 200 && afterLast < 100);
check("createBudget: ใช้ได้ตามงบแล้วหยุด", b.used === 2 && overBudget === "เกินงบการเรียกจริง (2 ครั้ง)");
check("โมเดลจริง (เฉพาะเมื่อเปิด RUN_LIVE=1): ได้คำตอบที่มี 5", !status.enabled || (liveError === "" && mentions(liveText, ["5", "ห้า", "five"])), liveError || "ตั้ง RUN_LIVE=1 เพื่อทดสอบส่วนนี้");
