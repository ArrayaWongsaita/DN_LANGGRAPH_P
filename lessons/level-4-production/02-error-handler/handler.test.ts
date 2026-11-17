import { Command } from "@langchain/langgraph";
import { buildCheckout, counter, onChargeFailed } from "./handler";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
vi.setConfig({ testTimeout: 30000 }); // retry มีเวลารอจริง

beforeEach(() => {
  counter.charge = 0;
});

test("handler เดี่ยว ๆ: สั่งไป compensate พร้อมเหตุผลที่มีชื่อ node และข้อความ error", () => {
  const command = onChargeFailed({}, { node: "charge", error: new Error("บัตรถูกปฏิเสธ") } as never);
  expect(command).toBeInstanceOf(Command);
  expect(command.goto).toEqual(["compensate"]);
  expect(command.update).toEqual({ status: "ชดเชยหลัง charge: บัตรถูกปฏิเสธ" });
});

test("node ล้มเหลว: graph ไม่พัง แต่ไปทางชดเชยพร้อมเหตุผล", async () => {
  const r = await buildCheckout().invoke({});
  expect(r.log).toBe("คืนเงิน (ชดเชยหลัง charge: บัตรถูกปฏิเสธ)");
});

test("handler ทำงานหลังลองใหม่ครบ 3 ครั้งแล้วเท่านั้น", async () => {
  await buildCheckout().invoke({});
  expect(counter.charge).toBe(3);
});
