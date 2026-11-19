import { HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-15
// เลือก "โมเดล" และ "tool" ตามคำถามแต่ละครั้ง: คำถามง่ายใช้โมเดลถูก คำถามยากใช้โมเดลแรง และเปิดเผย tool เฉพาะที่เกี่ยวข้อง
// (ในบทนี้สองโมเดลคือตัวเดียวกันคือ llm เพื่อให้รันง่าย งานจริงให้ "cheap" เป็นโมเดลเล็ก "strong" เป็นโมเดลใหญ่)
const models = { cheap: llm, strong: llm };
const allTools = [makeAddTool(), makeWeatherTool()];

// คำถามยาวกว่า 30 ตัวอักษรใช้ "strong" ไม่เช่นนั้นใช้ "cheap"
function pickModel(question: string): "cheap" | "strong" {
  // ข้อ 1: คืน "strong" ถ้า question.length > 30 ไม่เช่นนั้นคืน "cheap"
  return question.length > 30 ? "strong" : "cheap";
}

// ให้เห็น tool "getWeather" เฉพาะเมื่อคำถามมีคำว่า "อากาศ" ส่วน tool อื่นเห็นเสมอ
function pickTools(question: string, tools: StructuredToolInterface[]): StructuredToolInterface[] {
  // ข้อ 2: กรอง tools: ตัด getWeather ออกถ้า question ไม่มีคำว่า "อากาศ"
  return tools.filter((t) => t.name !== "getWeather" || question.includes("อากาศ"));
}

const State = new StateSchema({ messages: MessagesValue });
const picks: { model: string; tools: string[] }[] = [];

const graph = new StateGraph(State)
  .addNode("agent", async (state) => {
    const question = state.messages[0].text;
    const which = pickModel(question);
    const tools = pickTools(question, allTools);
    picks.push({ model: which, tools: tools.map((t) => t.name) });
    const bound = tools.length ? models[which].bindTools!(tools) : models[which];
    return { messages: [await bound.invoke(state.messages)] };
  })
  .addEdge(START, "agent")
  .addEdge("agent", END)
  .compile();

for (const question of ["สวัสดี", "ช่วยบอกอากาศของกรุงเทพวันนี้ให้หน่อยว่าร้อนแค่ไหน"]) {
  const result = await graph.invoke({ messages: [new HumanMessage(question)] });
  console.log(`"${question}" ->`, picks[picks.length - 1], result.messages[result.messages.length - 1].text.slice(0, 60));
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("คำถามสั้นใช้ cheap", pickModel("สวัสดี") === "cheap", "ยาวกว่า 30 ตัวอักษรถึงใช้ strong");
check("คำถามยาวใช้ strong", pickModel("ช่วยบอกอากาศของกรุงเทพวันนี้ให้หน่อยว่าร้อนแค่ไหน") === "strong");
check("คำถามที่ไม่มีคำว่า 'อากาศ' ไม่เห็น getWeather แต่เห็น add", JSON.stringify(picks[0].tools) === '["add"]', "ใช้ filter กับ t.name");
check("คำถามเรื่องอากาศเห็นทั้งสอง tool", picks[1].tools.includes("getWeather") && picks[1].tools.includes("add"));
