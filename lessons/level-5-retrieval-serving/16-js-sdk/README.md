# บทที่ 5-16: เรียกเซิร์ฟเวอร์ด้วย JS SDK

## แนวคิด
บท 5-15 คุณเรียก REST เอง ใน TypeScript ใช้ SDK ทางการแทนได้: `@langchain/langgraph-sdk` ห่อ endpoint เดียวกัน (รวม SSE, การแปลงข้อผิดพลาด):

```ts
import { Client } from "@langchain/langgraph-sdk";
const client = new Client({ apiUrl: "http://localhost:2024" /* , apiKey */ });

const thread = await client.threads.create();                                   // { thread_id, ... }
const result = await client.runs.wait(thread.thread_id, "order", { input });     // รันแล้วรอผล
for await (const ev of client.runs.stream(thread.thread_id, "order", { input, streamMode: ["updates"] })) { ev.event; ev.data }
const state = await client.threads.getState(thread.thread_id);                  // { values, next, tasks }
await client.runs.wait(thread.thread_id, "order", { command: { resume: true } }); // ต่อจาก interrupt
```
รูปแบบจริงที่สังเกตจากการรัน (ใช้ graph ที่มี `interrupt`):
- รันที่หยุดรออนุมัติ: `runs.wait` คืน `{ "__interrupt__": [{ id, value }] }` (ไม่ใช่ throw)
- `getState(...).tasks[].interrupts[]` เก็บคำถามที่ค้างอยู่ จึงกู้คืนได้แม้ผู้ใช้ปิดหน้าแล้วกลับมา
- สตรีม `updates` ที่เจอ interrupt มีคีย์ `__interrupt__` ปนมากับชื่อ node
- ข้อผิดพลาดเป็น `HTTPError` ที่มี `.status` (เช่น 404 ไม่พบ assistant)

ตัวตรวจใช้ **client ปลอม** ที่ทำตัวเหมือนเซิร์ฟเวอร์ (ผ่าน interface `ClientLike` ที่เป็นส่วนย่อยของ client จริง) จึงไม่ต้องเปิดเซิร์ฟเวอร์ ส่วน `pnpm lesson 5-16` ใช้ของจริง

## ดูตัวอย่าง
โฟลเดอร์ `server/` มี graph "order" ที่หยุดรออนุมัติ (`interrupt`) ให้แล้ว `chat.ts` ขาด 5 ส่วน

## โจทย์
เติม 5 ข้อ แล้วรัน:

    pnpm test:lesson 5-16

ลองกับเซิร์ฟเวอร์จริง:

    pnpm lesson 5-16

## คุณทำได้แล้ว
- ทำเวิร์กโฟลว์อนุมัติผ่านเซิร์ฟเวอร์: เริ่ม → หยุดรอ → กู้คำถามที่ค้าง → ตัดสินใจ → ต่อ พร้อมสตรีมและข้อความผิดพลาดที่เป็นมิตร

## ข้อควรจำ
- `thread_id` คือกุญแจของความต่อเนื่อง เก็บไว้ฝั่งผู้ใช้ (เช่นใน session)
- อย่าให้เบราว์เซอร์ถือ API key ของเซิร์ฟเวอร์ ให้ผ่านแบ็กเอนด์ของคุณ
- เวอร์ชัน SDK ต้องเข้ากับเซิร์ฟเวอร์ ตรวจเมื่ออัปเกรด

## บทถัดไป
บท 5-17: เรียกกราฟบนเซิร์ฟเวอร์เป็น node ด้วย RemoteGraph
