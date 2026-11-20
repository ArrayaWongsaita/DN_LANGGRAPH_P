# บทที่ 2-19 แยกทางตามคำตอบอนุมัติ

ต่อจาก [บท 2-18](../18-interrupt-resume/README.md) คราวนี้กราฟใช้คำตอบเพื่อเลือกว่าจะเผยแพร่รายงานหรือยกเลิก ในระหว่างรอคำตอบ แอปอ่านคำถามที่ค้างจาก checkpoint ของ thread เพื่อนำไปแสดงได้

## 1. ส่ง `true` กับ `false` ให้กราฟเดียวกัน

เติมข้อ 1 ใน [`approval.ts`](./approval.ts) ให้ router คืน `"execute"` เมื่ออนุมัติ และ `"cancelled"` เมื่อปฏิเสธ แล้วรันจากโฟลเดอร์หลักเพื่อดูว่าทั้งสองคำตอบไปถึงปลายทางของตัวเอง

```sh
pnpm lesson 2-19
```

ใน [`approval.ts`](./approval.ts) node `request` พักด้วย `interrupt` แล้วคืน `{ approved: answer === true }` เมื่อคนตอบ จากนั้น `addConditionalEdges` เลือกทางตาม `approved` โดยแต่ละทางคืนข้อความจำลองใน `result`

```ts
.addConditionalEdges(
  "request",
  (state) => state.approved ? "execute" : "cancelled",
  ["execute", "cancelled"],
)
```

ตอนรอคำตอบ อ่าน `value` จาก task ที่หยุด เมื่อได้คำตอบจึงส่ง `Command` กับ config เดิม

```ts
await graph.invoke({ action: "รายงานประจำเดือน" }, config);
const snapshot = await graph.getState(config);
const request: unknown = snapshot.tasks[0]?.interrupts[0]?.value;

const finished = await graph.invoke(new Command({ resume: answer }), config);
console.log(JSON.stringify({ answer, request, result: finished.result }));
```

ไฟล์ทดลองสอง thread และพิมพ์ผลดังนี้ ใช้ได้โดยไม่ต้องตั้ง API key

```text
{"answer":true,"request":{"question":"อนุมัติไหม?","action":"รายงานประจำเดือน"},"result":"เผยแพร่แล้ว: รายงานประจำเดือน"}
{"answer":false,"request":{"question":"อนุมัติไหม?","action":"รายงานประจำเดือน"},"result":"ยกเลิก: รายงานประจำเดือน"}
```

## 2. ค่าไหนใช้แสดง ค่าไหนใช้เลือกทาง

| ค่า | ชนิดหรือรูปแบบ | การใช้ |
|---|---|---|
| `snapshot.tasks[0]?.interrupts[0]?.value` | ออบเจ็กต์ `{ question, action }` ในบทนี้ หรือ `undefined` ถ้ายังไม่มี interrupt | นำรายละเอียดของคำขอไปแสดง |
| `resume` | ปุ่มอนุมัติส่ง `true` ปุ่มปฏิเสธส่ง `false` | ถูกคืนจาก `interrupt` ให้ node `request` |
| `approved` | `boolean` จาก `answer === true` | ตัวเลือกทางจะอ่านหลัง `request` เขียนลงใน State |
| ค่าที่ router คืน | `"execute"` หรือ `"cancelled"` | ชื่อ node ที่กราฟจะเรียกต่อ |

`tasks[0]` และ `interrupts[0]` ใช้ได้กับตัวอย่างนี้ที่รอคำตอบเพียงรายการเดียว ถ้าแอปมีหลาย task ให้หา task ที่ต้องการใน `snapshot.tasks` ก่อน

## 3. ลองส่งสตริงที่สะกดเหมือน boolean

คัดลอกโค้ดส่วนหลัง import จากเฉลยลง [`playground.ts`](./playground.ts) ตัดส่วนตรวจออก แล้วใช้ `pnpm play 2-19` เปลี่ยนค่าใน `["approve", true]` เพื่อเทียบผล

| ค่าที่ resume | เส้นทาง | `result` |
|---|---|---|
| `true` | `request → execute → END` | `"เผยแพร่แล้ว: รายงานประจำเดือน"` |
| `false` | `request → cancelled → END` | `"ยกเลิก: รายงานประจำเดือน"` |
| `"true"` | `request → cancelled → END` | `"ยกเลิก: รายงานประจำเดือน"` |

เงื่อนไข `answer === true` ยอมรับเฉพาะ boolean `true` ถ้าค่ามาจากแบบฟอร์มที่ส่งสตริง ให้แปลงเป็น boolean ก่อน resume ตามสัญญาที่ตั้งไว้

[ดูเฉลย](./solution/approval.ts) · [บทก่อนหน้า 2-18 หยุดรอคำตอบและทำต่อ](../18-interrupt-resume/README.md) · [บทถัดไป 2-20 ตรวจและแก้ร่าง](../20-review-edit/README.md)
