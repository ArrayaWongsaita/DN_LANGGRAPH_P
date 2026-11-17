import { makeTracingSchema, maskKey, readTracing } from "./tracing";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ไม่ตั้งอะไรเลย: ไม่เปิด tracing (ค่าเริ่มต้นคือไม่ส่งข้อมูลออก)", () => {
  expect(readTracing({})).toEqual({ enabled: false, project: "default", reason: "ไม่ได้เปิด" });
});

test("เปิด TRACING แต่ไม่มี key: ไม่เปิด และบอกสาเหตุ", () => {
  expect(readTracing({ LANGSMITH_TRACING: "true" })).toEqual({
    enabled: false,
    project: "default",
    reason: "ขาด LANGSMITH_API_KEY",
  });
});

test("เปิดครบ: enabled พร้อมชื่อโปรเจกต์", () => {
  expect(readTracing({ LANGSMITH_TRACING: "true", LANGSMITH_API_KEY: "lsv2_abcdefgh", LANGSMITH_PROJECT: "demo" })).toEqual({
    enabled: true,
    project: "demo",
    reason: "เปิด",
  });
});

test("key ว่างหรือเป็นช่องว่างล้วนไม่นับว่ามี key", () => {
  expect(readTracing({ LANGSMITH_TRACING: "true", LANGSMITH_API_KEY: "   " }).enabled).toBe(false);
});

test("TRACING=false ไม่เปิดแม้มี key", () => {
  expect(readTracing({ LANGSMITH_TRACING: "false", LANGSMITH_API_KEY: "lsv2_abcdefgh" }).enabled).toBe(false);
});

test("schema รับ source ว่างได้ และ maskKey ไม่โชว์ key เต็ม", () => {
  expect(() => makeTracingSchema().parse({})).not.toThrow();
  expect(maskKey("lsv2_abcdefgh")).toBe("lsv2...gh");
  expect(maskKey("short")).toBe("***");
});
