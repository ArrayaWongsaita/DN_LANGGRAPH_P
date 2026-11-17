import { begin, buildApp, reply } from "./subcheck";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("interrupt ใน subgraph หยุดทั้งระบบ", async () => {
  expect(await begin(buildApp(), "t")).toBe(true);
});

test("resume ผ่าน graph แม่: ไปถึง subgraph และทำต่อจนจบ (เตรียมไม่รันซ้ำ)", async () => {
  const app = buildApp();
  await begin(app, "t");
  expect(await reply(app, "t", "ใช่")).toBe("เตรียม|ตอบ:ใช่");
});

test("หลาย thread แยกกัน", async () => {
  const app = buildApp();
  await begin(app, "a");
  await begin(app, "b");
  expect(await reply(app, "b", "ไม่")).toBe("เตรียม|ตอบ:ไม่");
  expect(await reply(app, "a", "ใช่")).toBe("เตรียม|ตอบ:ใช่");
});
