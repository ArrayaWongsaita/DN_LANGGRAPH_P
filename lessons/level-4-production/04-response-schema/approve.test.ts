import { begin, buildApprovalApp, reply } from "./approve";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("คำตอบถูกรูปแบบ: ผ่าน และเติมค่า default ให้ (note เป็นสตริงว่าง)", async () => {
  const app = buildApprovalApp();
  await begin(app, "t");
  const r = await reply(app, "t", { approved: true });
  expect(r).toEqual({ ok: true, result: JSON.stringify({ approved: true, note: "" }) });
});

test("คำตอบผิดรูปแบบ: ถูกปฏิเสธ ไม่ใช่ผ่านเงียบ ๆ", async () => {
  const app = buildApprovalApp();
  await begin(app, "t");
  const r = await reply(app, "t", { approved: "yes" });
  expect(r.ok).toBe(false);
});

test("ตอบผิดแล้วตอบใหม่ให้ถูก: thread ยังรออยู่และทำต่อได้", async () => {
  const app = buildApprovalApp();
  await begin(app, "t");
  await reply(app, "t", { approved: "yes" });
  const r = await reply(app, "t", { approved: false, note: "ไม่ครบ" });
  expect(r).toEqual({ ok: true, result: JSON.stringify({ approved: false, note: "ไม่ครบ" }) });
});
