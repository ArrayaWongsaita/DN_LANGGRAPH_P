import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-10  (ไม่ใช้ LLM)
// ToolNode = node สำเร็จรูปที่ "รัน tool ทุกตัวที่ AIMessage ขอมา" แล้วคืนผลเป็น ToolMessage (จับคู่ด้วย tool_call_id)
const tools = [makeAddTool(), makeWeatherTool()];

// ข้อ 1: สร้าง ToolNode จาก tools
const node = new ToolNode(tools);

// AIMessage ที่ขอเรียก tool สองตัวพร้อมกัน (เหมือนที่ LLM จะส่งมา)
const request = new AIMessage({
  content: "",
  tool_calls: [
    { name: "add", args: { a: 1, b: 1 }, id: "x", type: "tool_call" },
    { name: "getWeather", args: { city: "เชียงใหม่" }, id: "y", type: "tool_call" },
  ],
});

// ข้อ 2: ส่ง { messages: [request] } เข้า node แล้วเอา .messages ของผลลัพธ์ (รายการ ToolMessage)
const results: ToolMessage[] = (await node.invoke({ messages: [request] })).messages;
console.log(results.map((m) => ({ id: m.tool_call_id, content: m.content })));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ผลครบ 2 ข้อความ (หนึ่งต่อหนึ่ง tool call)", results.length === 2, "ToolNode รันทุก tool call ใน AIMessage");
check("จับคู่ id ถูก: x -> '2', y -> อากาศเชียงใหม่", results[0]?.tool_call_id === "x" && results[0].content === "2" && results[1]?.tool_call_id === "y" && results[1].content === "อากาศเย็น 22 องศา");
