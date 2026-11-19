import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import { END, GraphRecursionError, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { todo } from "@src/todo";
import { makeAddTool } from "@src/sampleTools";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-12  (ไม่ใช้ LLM)
// agent ที่ไม่ยอมหยุดจะวนกินเงินไม่จบ: recursionLimit = จำนวน step สูงสุดที่ graph ยอมวิ่ง เกินแล้ว throw GraphRecursionError
// เพื่อให้ผลแน่นอน เราใช้ "agent จำลอง" ที่ขอ tool ครบจำนวนรอบที่ตั้งไว้ แล้วค่อยตอบ (ไม่เรียก LLM จริง)
const State = new StateSchema({ messages: MessagesValue });

function buildAgent(wantedRounds: number) {
  return new StateGraph(State)
    .addNode("agent", (state) => {
      const rounds = state.messages.filter((m) => m.type === "tool").length;
      const reply =
        rounds < wantedRounds
          ? new AIMessage({ content: "", tool_calls: [{ name: "add", args: { a: 1, b: 1 }, id: `c${rounds}`, type: "tool_call" }] })
          : new AIMessage("เสร็จแล้ว");
      return { messages: [reply] };
    })
    .addNode("tools", new ToolNode([makeAddTool()]))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();
}

const maxToolRounds = 2; // เรายอมให้ agent ใช้ tool ได้มากสุดกี่รอบ
// 👉 ข้อ 1: คำนวณ recursionLimit ที่พอสำหรับ maxToolRounds รอบ: 2 * maxToolRounds + 2 (เผื่อ 1 step ให้จุดเริ่ม)
const recursionLimit: number = todo(1);

const outcomes: Record<string, string> = {};
for (const [name, wantedRounds] of [["ใช้ tool 2 รอบ", 2], ["วนไม่หยุด (ขอ tool 100 รอบ)", 100]] as const) {
  try {
    // 👉 ข้อ 2: invoke agent ด้วย input { messages: [] } และ config { recursionLimit }
    // แนวทาง: await buildAgent(wantedRounds).invoke({ messages: [] }, { recursionLimit })
    const result: { messages: BaseMessage[] } = todo(2);
    outcomes[name] = `ok: ${result.messages[result.messages.length - 1].text}`;
  } catch (e) {
    // 👉 ข้อ 3: ถ้า e เป็น GraphRecursionError ให้บันทึก outcomes[name] = "limit" ถ้าเป็น error อื่นให้ throw ต่อ (อย่ากลืน error ที่ไม่รู้จัก)
    throw e;
  }
}
console.log("recursionLimit =", recursionLimit);
console.log(outcomes);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("recursionLimit = 6 สำหรับ 2 รอบ", recursionLimit === 6, "2 * maxToolRounds + 2");
check("agent ที่ใช้ tool 2 รอบ จบได้ภายใน limit", outcomes["ใช้ tool 2 รอบ"] === "ok: เสร็จแล้ว");
check("agent ที่วนไม่หยุดถูกหยุดที่ limit (ไม่ crash)", outcomes["วนไม่หยุด (ขอ tool 100 รอบ)"] === "limit", "จับ GraphRecursionError");
