# บทที่ 5-16 เรียกเซิร์ฟเวอร์ด้วย JS SDK

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

สคริปต์เปิดเซิร์ฟเวอร์ `langgraph dev` ให้ client จริงเรียก (ส่วนที่ 1) และมี **client ปลอม** ที่ทำตัวเหมือนเซิร์ฟเวอร์ (ผ่าน interface `ClientLike` ที่เป็นส่วนย่อยของ client จริง) ให้ส่วนตรวจใช้ได้โดยไม่ต้องเปิดอะไร

## 1. ลองเติมช่องเดียว

เปิด [`chat.ts`](./chat.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (เรียกเซิร์ฟเวอร์ด้วย JS SDK) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เปิดเซิร์ฟเวอร์ `langgraph dev` ชั่วคราวเอง (ต้องติดตั้งตามที่ README เดิมของ Level 4-5 อธิบายไว้) บทนี้ไม่เรียกโมเดลจริง

```sh
pnpm lesson 5-16
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

โฟลเดอร์ `server/` มี graph "order" ที่หยุดรออนุมัติ (`interrupt`) ให้แล้ว `chat.ts` ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
const { thread_id } = await client.threads.create();
const result = await client.runs.wait(thread_id, assistantId, { input: { item } });
return { threadId: thread_id, pending: result.__interrupt__?.[0]?.value, result };
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...
  started: {
    threadId: '01a1f97c-7672-75e0-91e0-c32b73f6549e',
    pending: { question: 'อนุมัติ หูฟัง ไหม' },
    result: { __interrupt__: [Array] }
  recovered: { question: 'อนุมัติ หูฟัง ไหม' },
  approved: { item: 'หูฟัง', note: 'เตรียม หูฟัง แล้ว', result: 'อนุมัติ หูฟัง' },
  afterDecision: undefined,
  streamed: [
    { type: 'node', node: 'prepare', update: [Object] },
    { type: 'interrupt', value: [Object] }
  ],
  badRaw: 'HTTP 404: No assistant found for "ไม่มีจริง". Make sure the ',
  badFriendly: 'ไม่พบ graph หรือ thread บนเซิร์ฟเวอร์'
✅ startOrder: สร้าง thread รัน และได้คำถามที่รออนุมัติ
✅ startOrder: กราฟที่ไม่หยุดรอ (ไม่มี interrupt) → pending เป็น undefined
✅ pendingApproval: กู้คำถามที่ค้างจาก state และคืน undefined เมื่อไม่มี
✅ pendingApproval: หา interrupt ได้แม้ task แรกไม่มี
✅ decide: ส่ง command.resume ตามการตัดสินใจ
✅ streamUpdates: แปลง updates เป็น node/interrupt ข้าม metadata, values, end
✅ describeError: แปลงตามสถานะ และไม่เผยรายละเอียดภายใน
✅ describeError: ต่อไม่ติดและกรณีอื่น
✅ เซิร์ฟเวอร์จริง: เริ่มงานแล้วหยุดรออนุมัติ และกู้คำถามเดิมจาก state ได้
✅ เซิร์ฟเวอร์จริง: อนุมัติแล้วได้ผลลัพธ์ และไม่มีคำถามค้างอีก
✅ เซิร์ฟเวอร์จริง: สตรีมการอัปเดตได้ node prepare แล้ว interrupt
✅ เซิร์ฟเวอร์จริง: assistant ที่ไม่มีได้ข้อความที่ผู้ใช้อ่านรู้เรื่อง ไม่ใช่ข้อความดิบ
```

สิ่งที่ได้: ทำเวิร์กโฟลว์อนุมัติผ่านเซิร์ฟเวอร์: เริ่ม → หยุดรอ → กู้คำถามที่ค้าง → ตัดสินใจ → ต่อ พร้อมสตรีมและข้อความผิดพลาดที่เป็นมิตร

## ข้อควรจำ

- `thread_id` คือกุญแจของความต่อเนื่อง เก็บไว้ฝั่งผู้ใช้ (เช่นใน session)
- อย่าให้เบราว์เซอร์ถือ API key ของเซิร์ฟเวอร์ ให้ผ่านแบ็กเอนด์ของคุณ
- เวอร์ชัน SDK ต้องเข้ากับเซิร์ฟเวอร์ ตรวจเมื่ออัปเกรด

## ลองต่อใน playground

รัน `pnpm play 5-16` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `chat.ts`](./solution/chat.ts) · ไปต่อ [บท 5-17 เรียกกราฟบนเซิร์ฟเวอร์เป็น node ด้วย RemoteGraph](../17-remote-graph/README.md)
