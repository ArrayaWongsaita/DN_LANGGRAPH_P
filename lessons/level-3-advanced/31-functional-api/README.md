# บทที่ 3-31: Functional API (`entrypoint` และ `task`)

## แนวคิด
นอกจาก Graph API ที่คุณใช้มาทั้งคอร์ส LangGraph มี **Functional API**: เขียนเวิร์กโฟลว์เป็นฟังก์ชัน async ธรรมดา ใช้ `if`, `for`, `Promise.all` ได้ตรง ๆ โดยไม่ต้องประกาศ State/node/edge ยังคงได้ความจำ (checkpointer), human-in-the-loop และ streaming เหมือนกัน

```ts
import { entrypoint, task } from "@langchain/langgraph";

const double = task("double", async (n: number) => n * 2);   // หน่วยงานที่ถูกบันทึกผล

const workflow = entrypoint({ name: "wf", checkpointer: new MemorySaver() }, async (n: number) => {
  const a = await double(n);
  const [b, c] = await Promise.all([double(a), double(a + 1)]); // ขนานด้วย Promise.all
  return b + c;
});

await workflow.invoke(3, { configurable: { thread_id: "1" } });
```
- `task(ชื่อ, ฟังก์ชัน)`: ส่วนที่ควรถูก **บันทึกผลเป็น checkpoint** (งานที่แพง มีผลข้างเคียง หรือเรียกโมเดล) ทำซ้ำตอน resume ได้โดยไม่รันใหม่
- `entrypoint`: ตัวเวิร์กโฟลว์ที่รับ input เดียว

**เมื่อไรเลือกอันไหน:** เอกสารของ LangGraph แนะนำ Graph API สำหรับ agent ใหม่ (เห็นภาพ ตรวจสอบง่าย) Functional API เหมาะกับงานที่เป็นลำดับขั้นตรง ๆ หรืออยากเพิ่มความทนทานให้โค้ดเดิมทีละน้อย

## ดูตัวอย่าง
`functional.ts` ขาดตัว task และตัวเวิร์กโฟลว์

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 3-31

## คุณทำได้แล้ว
- เขียนเวิร์กโฟลว์แบบ Functional API

## ข้อควรจำ
- input/output ของ task ต้องแปลงเป็น JSON ได้ (ถูกบันทึกลง checkpoint)
- ผลข้างเคียงใส่ใน task ไม่ใช่ตรง ๆ ใน entrypoint

## บทถัดไป
บท 3-32: ดูภาพของ graph
