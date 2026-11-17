import { buildCheckout, counter } from "./handler";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
vi.setConfig({ testTimeout: 30000 }); // retry มีเวลารอจริง

beforeEach(() => {
  counter.charge = 0;
});

test("node ล้มเหลว: graph ไม่พัง แต่ไปทางชดเชยพร้อมเหตุผล", async () => {
  const r = await buildCheckout().invoke({});
  expect(r.log).toBe("คืนเงิน (ชดเชยหลัง charge: บัตรถูกปฏิเสธ)");
});

test("handler ทำงานหลังลองใหม่ครบ 3 ครั้งแล้วเท่านั้น", async () => {
  await buildCheckout().invoke({});
  expect(counter.charge).toBe(3);
});
