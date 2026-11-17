import { buildTextGraph, clean, measure } from "./textGraph";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("clean ตัดช่องว่างหัวท้ายของ text แล้วคืนเป็น update", () => {
  expect(clean({ text: "  สวัสดี  ", length: 0 })).toEqual({ text: "สวัสดี" });
});

test("measure คืน update ที่มีความยาวของ text", () => {
  expect(measure({ text: "สวัสดี", length: 0 })).toEqual({ length: 6 });
});

test("graph ทำ clean แล้ว measure ตามลำดับ", async () => {
  const result = await buildTextGraph().invoke({ text: "   abc   " });
  expect(result).toEqual({ text: "abc", length: 3 });
});

test("node ต้องไม่แก้ state เดิมโดยตรง", () => {
  const state = { text: " x ", length: 0 };
  clean(state);
  expect(state.text).toBe(" x ");
});
