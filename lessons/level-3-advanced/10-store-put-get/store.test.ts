import { InMemoryStore } from "@langchain/langgraph";
import { getProfile, saveProfile } from "./store";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("บันทึกแล้วอ่านกลับได้", async () => {
  const store = new InMemoryStore();
  await saveProfile(store, "u1", { name: "มาลี", lang: "th" });
  expect(await getProfile(store, "u1")).toEqual({ name: "มาลี", lang: "th" });
});

test("ผู้ใช้ที่ไม่เคยบันทึก: undefined", async () => {
  expect(await getProfile(new InMemoryStore(), "nobody")).toBeUndefined();
});

test("บันทึกซ้ำคีย์เดิม = เขียนทับ และผู้ใช้อื่นไม่ถูกกระทบ", async () => {
  const store = new InMemoryStore();
  await saveProfile(store, "u1", { name: "เก่า", lang: "th" });
  await saveProfile(store, "u2", { name: "อื่น", lang: "en" });
  await saveProfile(store, "u1", { name: "ใหม่", lang: "th" });
  expect((await getProfile(store, "u1"))?.name).toBe("ใหม่");
  expect((await getProfile(store, "u2"))?.name).toBe("อื่น");
});
