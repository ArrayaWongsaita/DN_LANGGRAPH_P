import { classifyError, createBudget, eventually, liveStatus, mentions, normalize } from "./live";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ไม่เรียกโมเดลจริง ไม่ต้องมี key
const KEY = "k".repeat(20);

test("liveStatus: ไม่ตั้ง RUN_LIVE=1 → ข้ามพร้อมเหตุผล (แม้มี key)", () => {
  expect(liveStatus({ GROQ_API_KEY: KEY })).toEqual({ enabled: false, reason: "ข้าม: ตั้ง RUN_LIVE=1 เพื่อเปิด" });
  expect(liveStatus({ RUN_LIVE: "true", GROQ_API_KEY: KEY }).enabled).toBe(false);
  expect(liveStatus({ RUN_LIVE: "0", GROQ_API_KEY: KEY }).enabled).toBe(false);
});

test("liveStatus: provider เริ่มต้น groq ต้องมี GROQ_API_KEY ยาวพอ", () => {
  expect(liveStatus({ RUN_LIVE: "1" })).toEqual({ enabled: false, reason: "ข้าม: ไม่มี GROQ_API_KEY" });
  expect(liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: "สั้น" }).enabled).toBe(false);
  expect(liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: `  ${"k".repeat(9)}  ` }).enabled).toBe(false);
  expect(liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: KEY })).toEqual({ enabled: true, reason: "เปิด: groq" });
});

test("liveStatus: ใช้ key ของ provider ที่เลือกเท่านั้น และไม่รู้จักก็ข้าม", () => {
  expect(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "opencode", OPENCODE_GO_KEY: KEY })).toEqual({ enabled: true, reason: "เปิด: opencode" });
  expect(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "opencode", GROQ_API_KEY: KEY })).toEqual({ enabled: false, reason: "ข้าม: ไม่มี OPENCODE_GO_KEY" });
  expect(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "ollama", OLLAMA_API_KEY: KEY }).enabled).toBe(true);
  expect(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "ไม่มีจริง", GROQ_API_KEY: KEY })).toEqual({ enabled: false, reason: "ข้าม: ไม่รู้จัก provider ไม่มีจริง" });
});

test("liveStatus: เหตุผลไม่เคยมีค่าของ key", () => {
  for (const env of [{ RUN_LIVE: "1", GROQ_API_KEY: KEY }, { RUN_LIVE: "1", GROQ_API_KEY: "short" }, { GROQ_API_KEY: KEY }]) {
    expect(liveStatus(env).reason).not.toContain(env.GROQ_API_KEY);
  }
});

test("normalize: ไม่สนตัวพิมพ์/ช่องว่าง/อักขระความกว้างศูนย์", () => {
  expect(normalize("  คำ ตอบ  คือ 5\n")).toBe("คำตอบคือ5");
  expect(normalize("ABC​def﻿")).toBe("abcdef");
});

test("mentions any/all และทนช่องว่างที่โมเดลเติมในภาษาไทย", () => {
  expect(mentions("ผลลัพธ์ คือ 5 ครับ", ["ผลลัพธ์คือ5"])).toBe(true);
  expect(mentions("The answer is FIVE", ["five", "5"])).toBe(true);
  expect(mentions("answer 5", ["five", "6"])).toBe(false);
  expect(mentions("ก ข ค", ["ก", "ค"], "all")).toBe(true);
  expect(mentions("ก ข", ["ก", "ค"], "all")).toBe(false);
});

test("mentions: needles ว่าง หรือมีแต่สตริงว่าง ต้องไม่ผ่านโดยบังเอิญ", () => {
  expect(mentions("อะไรก็ได้", [])).toBe(false);
  expect(mentions("อะไรก็ได้", [""])).toBe(false);
  expect(mentions("อะไรก็ได้", [" ", ""], "all")).toBe(false);
  expect(mentions("abc", ["", "abc"], "all")).toBe(true);
});

test("classifyError: จัดประเภทตามสถานะและข้อความ", () => {
  const s = (status: number, message = "x") => Object.assign(new Error(message), { status });
  expect(classifyError(s(401))).toBe("auth");
  expect(classifyError(s(403))).toBe("auth");
  expect(classifyError(s(429))).toBe("rate-limit");
  expect(classifyError(new Error("Rate limit reached for model"))).toBe("rate-limit");
  expect(classifyError(new Error("You exceeded your current quota"))).toBe("rate-limit");
  expect(classifyError(s(503))).toBe("transient");
  expect(classifyError(new Error("read ECONNRESET"))).toBe("transient");
  expect(classifyError(new TypeError("fetch failed"))).toBe("transient");
  expect(classifyError(new Error("expected 5 to be 6"))).toBe("assertion");
  expect(classifyError("string")).toBe("assertion");
  expect(classifyError(undefined)).toBe("assertion");
});

test("eventually: สำเร็จครั้งแรกเรียกครั้งเดียว", async () => {
  let n = 0;
  expect(await eventually(async () => ++n)).toBe(1);
  expect(n).toBe(1);
});

test("eventually: ผลหลุดเกณฑ์เป็นครั้งคราวลองซ้ำจนผ่าน", async () => {
  let n = 0;
  const result = await eventually(async () => {
    if (++n < 3) throw new Error("ยังไม่ตรง");
    return "ผ่าน";
  });
  expect(result).toBe("ผ่าน");
  expect(n).toBe(3);
});

test("eventually: ครบจำนวนครั้งแล้วยังล้ม → error ที่บอกจำนวนครั้งและสาเหตุสุดท้าย", async () => {
  let n = 0;
  await expect(
    eventually(
      async () => {
        throw new Error(`ผิดครั้งที่ ${++n}`);
      },
      { attempts: 4 },
    ),
  ).rejects.toThrow("ล้มเหลวทั้ง 4 ครั้ง: ผิดครั้งที่ 4");
  expect(n).toBe(4);
});

test("eventually: ผิดสิทธิ์ (401/403) หยุดทันที ไม่เผาโควตา และโยน error เดิม", async () => {
  let n = 0;
  const authError = Object.assign(new Error("Invalid API key"), { status: 401 });
  await expect(
    eventually(async () => {
      n++;
      throw authError;
    }),
  ).rejects.toBe(authError);
  expect(n).toBe(1);
});

test("eventually: ปรับ delay ได้ (รอระหว่างครั้ง ไม่รอหลังครั้งสุดท้าย)", async () => {
  const started = Date.now();
  await expect(
    eventually(
      async () => {
        throw new Error("x");
      },
      { attempts: 3, delayMs: 30 },
    ),
  ).rejects.toThrow();
  const elapsed = Date.now() - started;
  expect(elapsed).toBeGreaterThanOrEqual(55); // 2 ช่วงรอ
  expect(elapsed).toBeLessThan(200); // ไม่รอหลังครั้งสุดท้าย
});

test("createBudget: ใช้ได้ตามงบแล้วหยุด", () => {
  const budget = createBudget(2);
  budget.spend();
  budget.spend();
  expect(budget.used).toBe(2);
  expect(() => budget.spend()).toThrow("เกินงบการเรียกจริง (2 ครั้ง)");
  expect(budget.used).toBe(2);
});

// ---- proposed kill tests (21) ----
test("[K21a] key of exactly MIN_KEY_LENGTH (10) is accepted", () => {
  expect(liveStatus({ RUN_LIVE: "1", GROQ_API_KEY: "k".repeat(10) }).enabled).toBe(true);
});

test("[K21b] empty LLM_PROVIDER falls back to groq (||, not ??)", () => {
  expect(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "", GROQ_API_KEY: KEY })).toEqual({ enabled: true, reason: "เปิด: groq" });
});

test("[K21c] normalize removes the whole U+200B..U+200D range", () => {
  expect(normalize("a‌b‍c")).toBe("abc");
});

test("[K21d] normalize applies NFC (decomposed == precomposed)", () => {
  expect(normalize("Café")).toBe(normalize("café"));
  expect(mentions("Café เปิดแล้ว", ["café"])).toBe(true);
});

test("[K21e] status 500 is transient (>=, not >)", () => {
  expect(classifyError(Object.assign(new Error("x"), { status: 500 }))).toBe("transient");
});

test("[K21f] eventually rejects right after the final attempt (no trailing delay)", async () => {
  let lastCall = 0;
  await expect(
    eventually(
      async () => {
        lastCall = Date.now();
        throw new Error("x");
      },
      { attempts: 2, delayMs: 150 },
    ),
  ).rejects.toThrow();
  expect(Date.now() - lastCall).toBeLessThan(100);
});

test("liveStatus: ชื่อ provider ที่ตรงกับคุณสมบัติของ Object (toString) ต้องถูกมองว่าไม่รู้จัก", () => {
  expect(liveStatus({ RUN_LIVE: "1", LLM_PROVIDER: "toString", GROQ_API_KEY: KEY })).toEqual({ enabled: false, reason: "ข้าม: ไม่รู้จัก provider toString" });
});
