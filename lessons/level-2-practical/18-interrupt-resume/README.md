# บทที่ 2-18 หยุด graph รอคำตอบแล้วทำต่อด้วย `interrupt`

ก่อนเผยแพร่รายงาน กราฟต้องขอคำตอบจากคน `interrupt` ส่งคำถามออกมาแล้วพักการทำงานไว้ เมื่อคนตอบ ให้เรียกกราฟอีกครั้งด้วย `Command({ resume: ... })` และ `thread_id` เดิม กราฟจะเริ่ม node ที่หยุดใหม่และ `interrupt` จะคืนคำตอบนั้น

## 1. หยุดแล้วตอบ `"yes"`

เติมข้อ 1 ใน [`pause.ts`](./pause.ts) ให้กราฟทำต่อด้วย `Command({ resume: reply })` และ `config` เดิม จากนั้นรันจากโฟลเดอร์หลัก แล้วดูให้ครบทั้งผลตอนหยุดและผลตอนทำต่อ

```sh
pnpm lesson 2-18
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

[`pause.ts`](./pause.ts) มี node `ask` เพียงตัวเดียว ใช้ `MemorySaver` เก็บจุดที่พักไว้ตาม [บท 2-02](../02-checkpointer/README.md) โค้ดส่วนหลักหลังเติมข้อ 1 มีดังนี้

```ts
const graph = new StateGraph(State)
  .addNode("ask", (state) => {
    const answer: unknown = interrupt({ question: "อนุมัติไหม?", action: state.action });
    return { decision: String(answer) };
  })
  .addEdge(START, "ask")
  .addEdge("ask", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "report" } };
const started = await graph.invoke({ action: "เผยแพร่รายงาน" }, config);
const reply = "yes";
const finished = await graph.invoke(new Command({ resume: reply }), config);
```

สคริปต์พิมพ์ค่าตอนหยุดและหลังทำต่อ ใช้ได้โดยไม่ต้องตั้ง API key

```text
{"pending":true,"request":{"question":"อนุมัติไหม?","action":"เผยแพร่รายงาน"}}
{"pending":false,"decision":"yes"}
```

`isInterrupted(started)` คืน `true` เมื่อผลจาก `invoke` มี interrupt ที่รออยู่ ตัวอย่างอ่านข้อมูลใน `started.__interrupt__[0]?.value` หลังตรวจค่านี้แล้ว รอบที่สองจบที่ `END` จึงได้ `pending: false`

## 2. ค่าในคำถามกับค่าในคำตอบ

| จุดที่ใส่ค่า | ชนิดและตัวอย่าง | ผล |
|---|---|---|
| `interrupt(value)` | ค่าที่แปลงเป็น JSON ได้ เช่น `{ question, action }` | ส่งข้อมูลให้ผู้เรียกนำไปแสดงตอนพัก |
| `new Command({ resume: reply })` | ส่งคำตอบ เช่น `"yes"`, `"no"` หรือค่า boolean | ทำให้ `interrupt` ที่พักอยู่คืนคำตอบใน node |
| `checkpointer` และ `thread_id` | ตัวเก็บสถานะและ `string` เช่น `"report"` | ระบุว่าจะบันทึกและเปิดงานใด `MemorySaver` เก็บในโปรเซสที่กำลังรัน |

ค่าที่ส่งออกจาก `interrupt` เป็นข้อมูลให้คนอ่าน ส่วนค่าที่ node ได้กลับมามาจาก `resume`

## 3. เปลี่ยนคำตอบแล้วดู State

คัดลอกโค้ดส่วนหลัง import จากเฉลยลง [`playground.ts`](./playground.ts) ตัดส่วนตรวจออก แล้วใช้ `pnpm play 2-18` เปลี่ยนค่า `reply` หนึ่งค่าและรันซ้ำ

| `reply` | ค่าจาก `invoke` รอบสอง |
|---|---|
| `"yes"` | `{"pending":false,"decision":"yes"}` |
| `"no"` | `{"pending":false,"decision":"no"}` |

ทั้งสองรอบมาถึง `END` เหมือนกัน บทถัดไปจะใช้คำตอบเลือก node ที่จะไปต่อ

[ดูเฉลย](./solution/pause.ts) · [บทก่อนหน้า 2-17 ผู้ช่วยจดโน้ต](../17-mini-project/README.md) · [บทถัดไป 2-19 แยกทางตามผลอนุมัติ](../19-approve-reject/README.md)
