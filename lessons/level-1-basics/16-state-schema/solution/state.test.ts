import { START, END, StateGraph } from "@langchain/langgraph";
import { ChatState } from "./state";

const passthrough = () => new StateGraph(ChatState)
  .addNode("noop", (s) => ({ question: s.question }))
  .addEdge(START, "noop")
  .addEdge("noop", END)
  .compile();

test("ค่าเริ่มต้นของทุก field เป็นสตริงว่าง", async () => {
  expect(await passthrough().invoke({})).toEqual({ question: "", answer: "" });
});

test("ค่าที่ส่งเข้าไปถูกเก็บใน state", async () => {
  const result = await passthrough().invoke({ question: "ชื่ออะไร" });
  expect(result.question).toBe("ชื่ออะไร");
});

test("ชนิดข้อมูลผิดถูกปฏิเสธ", async () => {
  await expect(passthrough().invoke({ question: 5 as unknown as string })).rejects.toThrow(/question/);
});
