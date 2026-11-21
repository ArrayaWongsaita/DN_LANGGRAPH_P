import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const State = new StateSchema({
  topic: z.string(),
  draft: z.string().default(""),
  final: z.string().default(""),
});

function improve(state: typeof State.State): { final: string } {
  // 👉 ข้อ 1 ต่อท้าย state.draft ด้วย " (ฉบับทบทวน)" แล้วคืนค่าเป็น final
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   return { final: `${state.draft} (ฉบับทบทวน)` };
  return todo(1);
}

const app = new StateGraph(State)
  .addNode("writeDraft", (state) => ({ draft: `หัวข้อ ${state.topic}` }))
  .addNode("improve", improve)
  .addEdge(START, "writeDraft")
  .addEdge("writeDraft", "improve")
  .addEdge("improve", END)
  .compile();

const result = await app.invoke({ topic: "การนอนหลับ" });
console.log(result.draft);
console.log(result.final);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("writeDraft สร้างร่างจาก topic", result.draft === "หัวข้อ การนอนหลับ");
check("improve เห็นร่างที่ writeDraft เพิ่งเขียน", result.final === "หัวข้อ การนอนหลับ (ฉบับทบทวน)", "อ่าน state.draft แล้วคืน final");

const revised = improve({ topic: "การนอนหลับ", draft: "ประโยชน์ของการนอนเต็มอิ่ม", final: "" });
check("ฉบับทบทวนใช้ข้อความใน draft", revised.final === "ประโยชน์ของการนอนเต็มอิ่ม (ฉบับทบทวน)");
