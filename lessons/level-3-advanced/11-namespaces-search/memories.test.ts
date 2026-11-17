import { InMemoryStore } from "@langchain/langgraph";
import { recall, remember } from "./memories";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("จำได้หลายชิ้นต่อผู้ใช้", async () => {
  const store = new InMemoryStore();
  await remember(store, "u1", "ชอบกาแฟ");
  await remember(store, "u1", "แพ้ถั่ว");
  expect((await recall(store, "u1")).sort()).toEqual(["ชอบกาแฟ", "แพ้ถั่ว"]);
});

test("ความจำของผู้ใช้คนหนึ่งไม่ปนกับอีกคน", async () => {
  const store = new InMemoryStore();
  await remember(store, "u1", "ของฉัน");
  await remember(store, "u2", "ของคนอื่น");
  expect(await recall(store, "u1")).toEqual(["ของฉัน"]);
});

test("ผู้ใช้ที่ไม่มีความจำ: ลิสต์ว่าง", async () => {
  expect(await recall(new InMemoryStore(), "nobody")).toEqual([]);
});
