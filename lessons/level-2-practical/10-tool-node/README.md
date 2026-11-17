# บทที่ 2-10: ToolNode รัน tool call ให้อัตโนมัติ

## แนวคิด
บท 2-09 เรารัน tool เอง ซึ่งต้องหา tool ตามชื่อ จับคู่ id และห่อผลเป็นข้อความเอง LangGraph มี **`ToolNode`** ทำให้ทั้งหมด:

```ts
import { ToolNode } from "@langchain/langgraph/prebuilt";

const node = new ToolNode([add, getWeather]);
const result = await node.invoke({ messages: [aiMessageThatHasToolCalls] });
result.messages // [ToolMessage, ...] หนึ่งข้อความต่อหนึ่ง tool call
```
- รับ State ที่ข้อความสุดท้ายเป็น `AIMessage` ที่มี `tool_calls`
- รัน **ทุก** tool call (ขนานกัน) แล้วคืน `ToolMessage` ที่มี `tool_call_id` ตรงกับคำขอ (LLM ใช้ id นี้จับคู่คำตอบกับคำขอ)
- ใช้เป็น node ใน graph ได้ตรง ๆ (บทหน้า)

## ดูตัวอย่าง
`toolNode.ts` มีฟังก์ชันสองตัว: สร้าง node และรันคำขอผ่าน node

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 2-10

## คุณทำได้แล้ว
- ใช้ `ToolNode` รัน tool call แทนการรันเอง

## ข้อควรจำ
- ผลของ tool กลับมาเป็น `ToolMessage` ไม่ใช่สตริงเปล่า
- `tool_call_id` ต้องตรงกับคำขอ ไม่เช่นนั้น LLM งง

## บทถัดไป
บท 2-11: ประกอบเป็นวงวน ReAct เต็มรูปแบบ
