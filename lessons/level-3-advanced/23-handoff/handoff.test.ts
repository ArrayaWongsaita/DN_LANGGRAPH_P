import { buildTeam } from "./handoff";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("เรื่องทั่วไป: sales ตอบเอง ไม่ส่งต่อ", async () => {
  const r = await buildTeam().invoke({ message: "อยากซื้อสินค้า" });
  expect(r.log).toBe("sales ตอบเอง;");
});

test("เรื่องของพัง: sales ส่งต่อให้ support แล้ว support ทำต่อ", async () => {
  const r = await buildTeam().invoke({ message: "สินค้าพัง" });
  expect(r.log).toBe("sales→support;support รับช่วง;");
});
