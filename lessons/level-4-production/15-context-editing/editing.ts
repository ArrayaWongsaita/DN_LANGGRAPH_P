import { HumanMessage } from "@langchain/core/messages";
import { createAgent, ClearToolUsesEdit, contextEditingMiddleware } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { todo } from "@src/todo";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-15
// context editing: ผลลัพธ์ tool เก่า ๆ กินบริบทไปเรื่อย ๆ ล้างของเก่าทิ้งเหลือแค่ล่าสุด (ใส่ placeholder แทน) โดยข้อความของผู้ใช้ไม่ถูกแตะ
// 👉 ข้อ 1: const edit = new ClearToolUsesEdit({ trigger: { tokens: 1 }, keep: { messages: 1 }, placeholder: "[ล้างแล้ว]" })
const edit = todo(1);
// 👉 ข้อ 2: const middleware = contextEditingMiddleware({ edits: [edit] })
const middleware = todo(2);

// โมเดลปลอมที่เรียก tool add สามครั้งติดกันแล้วตอบ: ดูว่า "โมเดลเห็นอะไร" ในแต่ละรอบ
const add = (id: string, n: number) => ({ toolCalls: [{ name: "add", args: { a: n, b: n }, id }] });
const toolTexts = (call: { type: string; text: string }[]) => call.filter((m) => m.type === "tool").map((m) => m.text);
const fake = fakeToolLLM([add("c1", 1), add("c2", 2), add("c3", 3), "จบ"]);
await createAgent({ model: fake, tools: [makeAddTool()], middleware: [middleware] }).invoke({ messages: [new HumanMessage("คำนวณ")] });

// โมเดลจริง: ให้บวกเลขหลายครั้ง
const real = await createAgent({ model: llm, tools: [makeAddTool()], middleware: [middleware] }).invoke({
  messages: [new HumanMessage("ใช้ tool add บวก 1+1 แล้วเอาผลไปบวก 2 แล้วเอาผลไปบวก 3 ทีละครั้ง บอกผลสุดท้าย")],
});
console.log("โมเดลจริงตอบ:", real.messages.at(-1)?.text);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ผลลัพธ์ tool เก่าถูกแทนด้วย placeholder เหลือเฉพาะอันล่าสุด", JSON.stringify(toolTexts(fake.calls[3])) === JSON.stringify(["[ล้างแล้ว]", "[ล้างแล้ว]", "6"]), "ClearToolUsesEdit({ keep: { messages: 1 } })");
check("รอบแรกยังไม่มีอะไรให้ล้าง และรอบที่สองเห็นผลลัพธ์อันแรกครบ", toolTexts(fake.calls[0]).length === 0 && JSON.stringify(toolTexts(fake.calls[1])) === JSON.stringify(["2"]));
check("ข้อความของผู้ใช้ไม่ถูกแตะ", fake.calls[3][0].text === "คำนวณ");
check("โมเดลจริงทำงานผ่าน middleware ได้และตอบผลสุดท้าย", (real.messages.at(-1)?.text ?? "").length > 0);
