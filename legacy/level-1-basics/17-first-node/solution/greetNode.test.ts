import { buildGreetGraph, greetNode } from "./greetNode";

test("node คืนเฉพาะส่วนที่อยากอัปเดต", () => {
  expect(greetNode({ question: "มาลี", answer: "" })).toEqual({ answer: "สวัสดี มาลี" });
});

test("node ไม่แก้ state ที่รับเข้ามา", () => {
  const state = { question: "มาลี", answer: "" };
  greetNode(state);
  expect(state).toEqual({ question: "มาลี", answer: "" });
});

test("graph START -> node -> END คืน state ที่รวมกันแล้ว", async () => {
  expect(await buildGreetGraph().invoke({ question: "มาลี" })).toEqual({
    question: "มาลี",
    answer: "สวัสดี มาลี",
  });
});
