import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { fakeLLM } from "../../../../src/fakeLLM";
import { askWithPersona } from "./persona";

function spied() {
  const llm = fakeLLM(["ตอบแล้ว"]);
  const spy = vi.spyOn(llm, "invoke");
  return { llm, spy };
}

test("ข้อความแรกที่ส่งคือ SystemMessage ที่มี persona", async () => {
  const { llm, spy } = spied();
  await askWithPersona(llm, "คุณคือครูใจดี", "1+1 เท่าไร");
  const messages = spy.mock.calls[0][0] as unknown[];
  expect(messages[0]).toBeInstanceOf(SystemMessage);
  expect((messages[0] as SystemMessage).content).toBe("คุณคือครูใจดี");
});

test("ข้อความสุดท้ายคือ HumanMessage ที่เป็นคำถาม", async () => {
  const { llm, spy } = spied();
  await askWithPersona(llm, "คุณคือครูใจดี", "1+1 เท่าไร");
  const messages = spy.mock.calls[0][0] as unknown[];
  const last = messages[messages.length - 1];
  expect(last).toBeInstanceOf(HumanMessage);
  expect((last as HumanMessage).content).toBe("1+1 เท่าไร");
});

test("คืนข้อความคำตอบ", async () => {
  expect(await askWithPersona(fakeLLM(["ตอบแล้ว"]), "p", "q")).toBe("ตอบแล้ว");
});
