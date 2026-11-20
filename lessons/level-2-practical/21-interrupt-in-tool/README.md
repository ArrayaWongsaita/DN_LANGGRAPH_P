# บทที่ 2-21 ขออนุมัติในเครื่องมือด้วย `interrupt`

เมื่อ agent ขอใช้ `sendEmail` เครื่องมือรู้แล้วว่าจะส่งถึงใคร จึงขออนุมัติพร้อมชื่อผู้รับตรงจุดนั้นได้ บทนี้ใช้ `createAgent` จาก [บท 2-16](../16-create-agent/README.md) กับโมเดลตามสคริปต์ การส่งอีเมลจำลองด้วยการเพิ่มผู้รับลงใน array `sent`

## 1. หยุดใน `sendEmail` ก่อนเพิ่มผู้รับ

เติมข้อ 1 ใน [`gate.ts`](./gate.ts) ให้ tool ส่ง `action` และ `to` ด้วย `interrupt` ก่อนเพิ่มผู้รับ แล้วรันจากโฟลเดอร์หลัก ตรวจว่า `sent` มีเฉพาะผู้รับที่ได้รับอนุมัติ

```sh
pnpm lesson 2-21
```

[`gate.ts`](./gate.ts) มี tool `sendEmail` ที่รับ `{ to }` โค้ดส่วนฟังก์ชันของ tool หลังเติมข้อ 1 มีดังนี้

```ts
({ to }) => {
  console.log(`เข้า sendEmail(${to})`);
  const approved: unknown = interrupt({ action: "sendEmail", to });
  if (approved !== true) return "ยกเลิกแล้ว";
  sent.push(to);
  return `ส่งอีเมลถึง ${to} แล้ว`;
}
```

สำหรับผู้รับแต่ละคน สคริปต์เริ่ม agent ด้วย `thread_id` ของผู้รับ พิมพ์คำขอที่ค้าง แล้วส่งผลอนุมัติด้วย `new Command({ resume: answer })` ใน thread เดิม ผลจาก tool อยู่ในข้อความชนิด `tool` รันได้โดยไม่ต้องตั้ง API key

```text
เข้า sendEmail(mali@example.com)
{"request":{"action":"sendEmail","to":"mali@example.com"},"sent":[]}
เข้า sendEmail(mali@example.com)
{"answer":true,"result":"ส่งอีเมลถึง mali@example.com แล้ว","sent":["mali@example.com"]}
เข้า sendEmail(somchai@example.com)
{"request":{"action":"sendEmail","to":"somchai@example.com"},"sent":["mali@example.com"]}
เข้า sendEmail(somchai@example.com)
{"answer":false,"result":"ยกเลิกแล้ว","sent":["mali@example.com"]}
```

บรรทัด `เข้า sendEmail(...)` ปรากฏสองครั้งต่อผู้รับ เพราะเมื่อ resume การรันเริ่มจากต้น tool อีกครั้ง

## 2. ค่าที่ส่งไปกลับและตำแหน่งที่ทำงานจริง

| จุด | ชนิดและตัวอย่าง | ผล |
|---|---|---|
| อินพุตของ tool | `{ to: string }` โดย schema ตรวจรูปแบบอีเมล | ระบุผู้รับ |
| `interrupt(value)` | ข้อมูล JSON เช่น `{ action: "sendEmail", to }` | แสดงให้คนเห็นว่าจะทำอะไรกับผู้รับคนไหน |
| `resume` | `true` หรือ `false` ตามข้อกำหนดของ tool นี้ | เฉพาะ boolean `true` ผ่านไปถึง `sent.push(to)` |
| `checkpointer` | `new MemorySaver()` | เก็บจุดที่ agent พักและเปิดต่อด้วย `thread_id` เดิม |

วางการส่งจริงหรือการเขียนข้อมูลหลังตรวจผลอนุมัติ เพราะโค้ดก่อน `interrupt` รันซ้ำได้ ถ้าต้องรองรับการลองใหม่หลังส่งไปแล้ว ให้ใช้รหัสคำขอเดียวกันเพื่อตรวจว่าการส่งครั้งนั้นเกิดขึ้นแล้วหรือยัง

`interrupt` ส่งสัญญาณหยุดโดย throw `GraphInterrupt` เมื่อมี `try/catch` ครอบ ให้โยนสัญญาณนี้ต่อถึง graph ถ้าเรียก `interrupt` หลายครั้งใน node เดียว ให้คงลำดับการเรียกไว้เพื่อให้คำตอบจับคู่กับจุดที่พักตามลำดับ

## 3. เปลี่ยนการตอบของสมชายแล้วดูผู้รับใน `sent`

คัดลอกโค้ดส่วนหลัง import จากเฉลยลง [`playground.ts`](./playground.ts) ตัดส่วนตรวจออก แล้วใช้ `pnpm play 2-21` คง `true` ของมาลีไว้ เปลี่ยนค่าในคู่ `["somchai@example.com", false]` แล้วเทียบบรรทัดสุดท้าย

| `answer` ของสมชาย | `result` | `sent` หลัง resume |
|---|---|---|
| `false` | `"ยกเลิกแล้ว"` | `["mali@example.com"]` |
| `true` | `"ส่งอีเมลถึง somchai@example.com แล้ว"` | `["mali@example.com","somchai@example.com"]` |
| `"true"` | `"ยกเลิกแล้ว"` | `["mali@example.com"]` |

[ดูเฉลย](./solution/gate.ts) · [บทก่อนหน้า 2-20 ตรวจและแก้ร่าง](../20-review-edit/README.md) · [บทถัดไป 2-22 สตรีมข้อความจากโมเดล](../22-stream-messages/README.md)
