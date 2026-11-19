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
`create.ts` เรียก `createAgent` ไว้แล้ว ขาด 3 อย่างที่ใส่ในออปชัน: model, systemPrompt และ checkpointer

## โจทย์
เติม 3 ข้อ (ค้นหา `// 👉 ข้อ N` ในไฟล์) แล้วรัน:

    pnpm lesson 2-16

สคริปต์จะพิมพ์ผล แล้วท้ายไฟล์มีส่วนตรวจที่แสดง ✅/❌ (ไม่ต้องแก้และไม่ต้องอ่านก็ได้)

## คุณทำได้แล้ว
- สร้าง agent พร้อม tool, system prompt และความจำด้วย `createAgent`

## ข้อควรจำ
- `createAgent` คืน graph ที่ใช้ `invoke`/`stream`/`getState` ได้เหมือน graph ที่เราสร้างเอง
- `systemPrompt` ไม่ปนอยู่ใน `messages` ของ State แต่ถูกเติมหน้าสุดตอนเรียก LLM

## ลองเล่นต่อ
อยากทดลองเองโดยไม่มีส่วนตรวจคำตอบ: `pnpm play 2-16` จะรันไฟล์ `playground.ts` ในโฟลเดอร์บทนี้ (สร้างให้แล้ว มีแต่ import ที่ใช้ เขียนโค้ดต่อเองได้เลย) ในหัวไฟล์มีไอเดียให้ลองทำ ใช้ `--watch` ให้รันซ้ำทุกครั้งที่บันทึก และ `--reset` เพื่อเริ่มใหม่

## บทถัดไป
บท 2-17: โปรเจกต์เล็ก ผู้ช่วยจดโน้ตที่จำข้ามการรีสตาร์ต
