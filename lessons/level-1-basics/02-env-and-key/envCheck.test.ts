import { buildSettingsSchema, checkKey, checkSettings } from "./envCheck";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("schema ใส่ค่าเริ่มต้นให้เมื่อไม่ได้ตั้ง: provider = groq, model = ว่าง", () => {
  expect(buildSettingsSchema().parse({})).toEqual({ LLM_PROVIDER: "groq", LLM_MODEL: "" });
});

test("checkSettings: ค่าถูกต้องผ่าน และตัดช่องว่างหัวท้ายของ model", () => {
  const result = checkSettings({ LLM_PROVIDER: "ollama", LLM_MODEL: "  my-model  " });
  expect(result).toEqual({ ok: true, value: { LLM_PROVIDER: "ollama", LLM_MODEL: "my-model" } });
});

test("checkSettings: ไม่ได้ตั้งอะไรเลยก็ผ่าน (ใช้ค่าเริ่มต้น)", () => {
  const result = checkSettings({});
  expect(result.ok).toBe(true);
});

test("checkSettings: ตัวแปรอื่นใน env ที่เราไม่สน (เช่น PATH) ถูกข้าม ไม่ติดมาในผลลัพธ์", () => {
  const result = checkSettings({ PATH: "/usr/bin", HOME: "/home/x" });
  expect(result).toEqual({ ok: true, value: { LLM_PROVIDER: "groq", LLM_MODEL: "" } });
});

test("checkSettings: provider ที่ไม่รู้จัก ไม่ผ่าน และข้อความบอกชื่อตัวแปรที่ผิด", () => {
  const result = checkSettings({ LLM_PROVIDER: "nope" });
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toContain("LLM_PROVIDER");
  }
});

test("checkKey: มี key ผ่าน และตัดช่องว่างหัวท้าย", () => {
  expect(checkKey({ GROQ_API_KEY: "  gsk_abc  " }, "GROQ_API_KEY")).toEqual({ ok: true, key: "gsk_abc" });
});

test("checkKey: ไม่มี key หรือเป็นช่องว่างล้วน ไม่ผ่าน และข้อความพูดถึงชื่อตัวแปร", () => {
  for (const env of [{}, { K: "" }, { K: "   " }]) {
    const result = checkKey(env, "K");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.problem).toContain("K");
  }
});
