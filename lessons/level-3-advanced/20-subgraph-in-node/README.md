# บทที่ 3-20 subgraph เรียกใน node (คนละ State)

## แนวคิด

graph ที่เสร็จแล้วใช้เป็น **ชิ้นส่วน** ของ graph ใหญ่ได้ เรียกว่า subgraph วิธีแรกที่ยืดหยุ่นที่สุดคือ **เรียกมันข้างใน node** เหมือนเรียกฟังก์ชัน เหมาะเมื่อ subgraph กับ graph แม่มี **State คนละหน้าตา** (เช่นแม่มี `doc` ส่วนลูกใช้ `text`) เราเองเป็นคนแปลงเข้า-ออก:

```ts
.addNode("callCounter", async (state) => {
  const result = await counter.invoke({ text: state.doc }); // แปลง doc → text
  return { count: result.wc };                              // แปลงผล wc → count
})
```
ข้อดี: subgraph ไม่ต้องรู้จัก State ของแม่ นำกลับมาใช้ซ้ำในที่อื่นได้ ข้อเสีย: ภาพกราฟของแม่ไม่เห็นข้างใน

## 1. ลองเติมช่องเดียว

เปิด [`insidenode.ts`](./insidenode.ts) แล้วเติมข้อ 1: เรียก subgraph `counter` ข้างใน node ของ graph แม่ แล้วแปลง field กลับ รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-20
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี subgraph `counter` (State ของมันใช้ field `text` และคืน `wc`) และ graph แม่ที่ใช้ field `doc` กับ `count` ให้แล้ว ขาดแค่ node ที่เรียก subgraph และแปลงชื่อ field

โค้ดตามแนวทาง:

```ts
const out = await counter.invoke({ text: state.doc });
return { count: out.wc };
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ a: 4, b: 1 }
✅ นับคำของเอกสารยาว = 4
✅ นับคำของเอกสารสั้น = 1
```

สิ่งที่ได้: ใช้ graph หนึ่งเป็นชิ้นส่วนของอีก graph โดยแปลง State เอง

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ฝั่ง | field | หมายเหตุ |
|---|---|---|
| graph แม่ | `doc` (เข้า), `count` (ออก) | State ของแม่ |
| subgraph `counter` | `text` (เข้า), `wc` (ออก) | State ของลูก แยกจากแม่ |
| node ที่เชื่อม | `counter.invoke({ text: state.doc })` แล้วคืน `{ count: out.wc }` | แปลงชื่อ field เองทั้งสองทาง |

## ข้อควรจำ

- ชื่อ node ของแม่ต้องไม่ซ้ำกับชื่อ field ใน State (ที่นี่ field ชื่อ `count` จึงตั้งชื่อ node ว่า `callCounter`)
- subgraph แยก State ของตัวเอง ค่าที่ไม่ได้แปลงจะไม่ไหลข้าม
- `invoke` ของ subgraph ใน node จะไม่เห็นความจำของแม่ เว้นแต่ส่งไปเอง

## ลองต่อใน playground

รัน `pnpm play 3-20` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `insidenode.ts`](./solution/insidenode.ts) · ไปต่อ [บท 3-21 ใส่ subgraph เป็น node โดยตรง (ใช้ State ร่วมกัน)](../21-subgraph-as-node/README.md)
