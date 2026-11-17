import { AIMessage } from "@langchain/core/messages";
import { fakeModel } from "langchain";
import { ask, buildCalculator } from "./agenttest";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้ fakeModel ทางการของ langchain
test("โมเดลขอเรียก tool แล้วตอบสุดท้าย: agent ทำครบและได้คำตอบ", async () => {
  const model = fakeModel()
    .respondWithTools([{ name: "add", args: { a: 2, b: 3 }, id: "c1" }])
    .respond(new AIMessage("ผลคือ 5"));
  expect(await ask(buildCalculator(model), "2+3 เท่าไร")).toBe("ผลคือ 5");
  expect(model.callCount).toBe(2);
});

test("รอบที่สองโมเดลเห็นผลลัพธ์ของ tool (5) ในประวัติ", async () => {
  const model = fakeModel()
    .respondWithTools([{ name: "add", args: { a: 2, b: 3 }, id: "c1" }])
    .respond(new AIMessage("ผลคือ 5"));
  await ask(buildCalculator(model), "2+3 เท่าไร");
  const second = model.calls[1].messages;
  expect(second.some((m: { type: string; text: string }) => m.type === "tool" && m.text === "5")).toBe(true);
});

test("โมเดลล้ม: ได้ข้อความสุภาพ ไม่ใช่ exception", async () => {
  const model = fakeModel().respond(new Error("rate limit"));
  expect(await ask(buildCalculator(model), "x")).toBe("ขออภัย ระบบขัดข้อง");
});
