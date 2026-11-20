import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";
import { fakeToolLLM } from "@src/fakeToolLLM";

const model: BaseChatModel = process.env.LESSON_LIVE === "1"
  ? (await import("../../02-llm-config/solution/llm")).llm
  : fakeToolLLM([
      '{"category":"greeting"}',
      '{"category":"question"}',
      "LangGraph ใช้สร้าง workflow ที่มี State",
    ]);

const categorySchema = z.object({ category: z.enum(["greeting", "question"]) });
const classifier = model.withStructuredOutput(categorySchema, { method: "functionCalling" });
const State = new StateSchema({
  question: z.string(),
  category: z.string().default(""),
  answer: z.string().default(""),
});

function pickRoute({ category }: { category: string }): "smallTalk" | "respond" {
  return category === "greeting" ? "smallTalk" : "respond";
}

const graph = new StateGraph(State)
  .addNode("classify", async ({ question }) => {
    const result = await classifier.invoke(`จัดประเภทข้อความนี้: ${question}`);
    return { category: result.category };
  })
  .addNode("smallTalk", () => ({ answer: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ" }))
  .addNode("respond", async ({ question }) => {
    const reply = await model.invoke(question);
    return { answer: reply.text };
  })
  .addEdge(START, "classify")
  .addConditionalEdges("classify", pickRoute, ["smallTalk", "respond"])
  .addEdge("smallTalk", END)
  .addEdge("respond", END)
  .compile();

const outputs: { category: string; answer: string }[] = [];
for (const question of ["สวัสดี", "LangGraph ใช้ทำอะไร ตอบสั้น ๆ"]) {
  const { category, answer } = await graph.invoke({ question });
  outputs.push({ category, answer });
  console.log(JSON.stringify({ question, category, answer }));
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("ข้อความทักทายได้คำตอบจาก smallTalk", outputs[0].category === "greeting" && outputs[0].answer === "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ");
check("คำถามได้คำตอบจาก respond", outputs[1].category === "question" && outputs[1].answer.trim().length > 0);
