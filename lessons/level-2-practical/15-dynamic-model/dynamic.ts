// รันด้วย pnpm lesson 2-15
import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { check } from "@src/check";
import { todo } from "@src/todo";

const models = {
  cheap: fakeToolLLM(["คำตอบจาก cheap", "คำตอบจาก cheap"]),
  strong: fakeToolLLM(["คำตอบจาก strong", "คำตอบจาก strong"]),
};
const allTools = [makeAddTool(), makeWeatherTool()];

function choose(question: string): { model: "cheap" | "strong"; tools: typeof allTools } {
  // 👉 ข้อ 1 คืน model เป็น "strong" เมื่อยาวกว่า 30 ตัว และส่ง getWeather เฉพาะเมื่อมีคำว่า "อากาศ"
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const model = question.length > 30 ? "strong" : "cheap";
  //   const tools = allTools.filter((tool) => tool.name !== "getWeather" || question.includes("อากาศ"));
  //   return { model, tools };
  return todo(1);
}

const State = new StateSchema({
  messages: MessagesValue,
  model: z.enum(["cheap", "strong"]).optional(),
  tools: z.array(z.string()).default([]),
});

const graph = new StateGraph(State)
  .addNode("chat", async (state) => {
    const { model, tools } = choose(state.messages[0].text);
    const reply = await models[model].bindTools(tools).invoke(state.messages);
    return { model, tools: tools.map((tool) => tool.name), messages: [reply] };
  })
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile();

for (const question of ["สวัสดี", "ช่วยบอกอากาศของกรุงเทพวันนี้ให้หน่อยว่าร้อนแค่ไหน"]) {
  const result = await graph.invoke({ messages: [new HumanMessage(question)] });
  console.log(JSON.stringify({
    question,
    model: result.model,
    tools: result.tools,
    reply: result.messages.at(-1)?.text,
  }));
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("คำถามยาว 30 ตัวใช้ cheap ส่วน 31 ตัวใช้ strong", choose("a".repeat(30)).model === "cheap" && choose("a".repeat(31)).model === "strong");
check("คำถามสั้นทั่วไปส่ง add ให้ cheap", models.cheap.boundToolNames.join(",") === "add");
check("คำถามยาวเรื่องอากาศส่งทั้งสอง tool ให้ strong", models.strong.boundToolNames.join(",") === "add,getWeather");
