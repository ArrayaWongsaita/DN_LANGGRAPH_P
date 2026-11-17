# บทที่ 2-16: createAgent ทางลัดที่ใช้ในงานจริง

## แนวคิด
บท 2-11 ถึง 2-15 เราสร้าง agent เองทีละชิ้น งานจริงส่วนใหญ่ใช้ **`createAgent`** จากแพ็กเกจ `langchain` ที่ประกอบวงวนให้ในบรรทัดเดียว:

```ts
import { createAgent } from "langchain";

const agent = createAgent({
  model: llm,                        // โมเดลที่ใช้
  tools: [add, getWeather],          // tool ทั้งหมด
  systemPrompt: "คุณคือผู้ช่วยที่ตอบสั้น", // คำสั่งประจำตัว
  checkpointer: new MemorySaver(),   // ความจำ (ไม่ใส่ก็ได้)
});
await agent.invoke({ messages: [new HumanMessage("2+3")] }, { configurable: { thread_id: "a" } });
```
ข้างในมันคือ graph ที่คุณสร้างไว้ในบท 2-11 (agent ⇄ tools) เพิ่มของที่ต้องใช้จริง และเพราะคุณเคยสร้างเองแล้ว เมื่อมันทำงานแปลก ๆ คุณรู้ว่าต้องมองตรงไหน

## ดูตัวอย่าง
`create.ts` มี `buildAssistant` ที่ต้องประกอบ `createAgent` ให้ครบ

## โจทย์
เติม 3 ข้อ แล้วรัน:

    pnpm test:lesson 2-16

## คุณทำได้แล้ว
- สร้าง agent พร้อม tool, system prompt และความจำด้วย `createAgent`

## ข้อควรจำ
- `createAgent` คืน graph ที่ใช้ `invoke`/`stream`/`getState` ได้เหมือน graph ที่เราสร้างเอง
- `systemPrompt` ไม่ปนอยู่ใน `messages` ของ State แต่ถูกเติมหน้าสุดตอนเรียก LLM

## บทถัดไป
บท 2-17: โปรเจกต์เล็ก ผู้ช่วยจดโน้ตที่จำข้ามการรีสตาร์ต
