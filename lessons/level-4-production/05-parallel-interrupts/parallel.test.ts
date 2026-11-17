import { buildForm, fillForm } from "./parallel";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const answerer = (q: string) => (q.includes("ชื่อ") ? "มาลี" : "เชียงใหม่");

test("สองคำถามขนาน: ตอบทีเดียวด้วย map แล้วได้ครบทั้งสองช่อง", async () => {
  const r = await fillForm(buildForm(), answerer);
  expect(r).toMatchObject({ name: "มาลี", city: "เชียงใหม่" });
});

test("ฟังก์ชันตอบถูกเรียกครั้งเดียวต่อคำถาม และเห็นคำถามจริง", async () => {
  const seen: string[] = [];
  await fillForm(buildForm(), (q) => {
    seen.push(q);
    return answerer(q);
  });
  expect(seen.sort()).toEqual(["ชื่ออะไร?", "อยู่เมืองไหน?"]);
});
