import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { buildConversation } from "./conversation";

test("แปลง role เป็น HumanMessage / AIMessage", () => {
  const msgs = buildConversation([
    { role: "user", text: "ถาม" },
    { role: "assistant", text: "ตอบ" },
  ]);
  expect(msgs[0]).toBeInstanceOf(HumanMessage);
  expect(msgs[1]).toBeInstanceOf(AIMessage);
});

test("รักษาลำดับและข้อความ", () => {
  const msgs = buildConversation([
    { role: "user", text: "หนึ่ง" },
    { role: "assistant", text: "สอง" },
    { role: "user", text: "สาม" },
  ]);
  expect(msgs.map((m) => m.content)).toEqual(["หนึ่ง", "สอง", "สาม"]);
});

test("array ว่างได้ array ว่าง", () => {
  expect(buildConversation([])).toEqual([]);
});
