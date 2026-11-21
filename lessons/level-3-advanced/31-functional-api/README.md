# บทที่ 3-31 Functional API (`entrypoint` และ `task`)

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

## 1. ลองเติมช่องเดียว

เปิด [`functional.ts`](./functional.ts) แล้วเติมข้อ 1: สร้าง workflow ด้วย `entrypoint` ที่เรียก task `double` แบบต่อเนื่องแล้วแบบขนานด้วย `Promise.all` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-31
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี task `double` ที่ห่อด้วย `task` ให้แล้ว ขาดแค่ตัว workflow

โค้ดตามแนวทาง:

```ts
const workflow = entrypoint({ name: "wf", checkpointer: new MemorySaver() }, async (n: number) => {
  const a = await double(n);
  const [x, y] = await Promise.all([double(a), double(a + 1)]);
  return x + y;
});
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
ผลลัพธ์: 26 task double ถูกรัน 3 ครั้ง
✅ ผลลัพธ์ถูก: a=6, double(6)=12, double(7)=14 รวม 26
✅ task double ถูกเรียก 3 ครั้ง
```

สิ่งที่ได้: เขียนเวิร์กโฟลว์แบบ Functional API

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วน | ตัวอย่าง | หน้าที่ |
|---|---|---|
| `task` | `task("double", async (n: number) => n * 2)` | งานย่อยที่บันทึกผลลง checkpoint |
| `entrypoint` | `entrypoint({ name: "wf", checkpointer }, async (n) => ...)` | ฟังก์ชันเวิร์กโฟลว์หลัก เขียนด้วย `if`, `for`, `Promise.all` ได้ตรง ๆ |
| `Promise.all` | `await Promise.all([double(a), double(a + 1)])` | รัน task ขนานกัน |

## ข้อควรจำ

- input/output ของ task ต้องแปลงเป็น JSON ได้ (ถูกบันทึกลง checkpoint)
- ผลข้างเคียงใส่ใน task ไม่ใช่ตรง ๆ ใน entrypoint

## ลองต่อใน playground

รัน `pnpm play 3-31` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `functional.ts`](./solution/functional.ts) · ไปต่อ [บท 3-32 ดูภาพของ graph (Mermaid)](../32-visualize/README.md)
