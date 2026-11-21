# บทที่ 4-03 ค่าเริ่มต้นของทุก node (`setNodeDefaults`)

## แนวคิด

ถ้าคุณอยากให้ **ทุก node** มี retry (หรือ timeout, errorHandler, cache) เหมือนกัน การใส่ทีละ node ซ้ำซาก LangGraph ให้ตั้งค่าเริ่มต้นทั้ง graph ครั้งเดียว:

```ts
new StateGraph(State)
  .setNodeDefaults({ retryPolicy: { maxAttempts: 3 }, timeout: 30_000 })
  .addNode("a", a)                                           // ได้ค่าเริ่มต้น
  .addNode("b", b, { retryPolicy: { maxAttempts: 1 } })      // ตั้งเองทับ: ไม่ลองใหม่
```
- ค่าที่ตั้งตอน `addNode` **ทับ** ค่าเริ่มต้นเป็นรายตัว
- ลำดับการเรียกไม่สำคัญ (ถูกสรุปตอน `compile`)
- subgraph ไม่รับค่าเริ่มต้นของ graph แม่

## 1. ลองเติมช่องเดียว

เปิด [`defaults.ts`](./defaults.ts) แล้วเติมข้อ 1: ตั้งค่าเริ่มต้นของทุก node ด้วย `retryPolicy` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 4-03
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี node `a`, `b` ที่ล้มเหลวสองครั้งแรกแล้วสำเร็จ กับ node `strict` ที่ตั้ง `maxAttempts: 1` ทับไว้แล้ว ขาดแค่ค่าเริ่มต้น

โค้ดตามแนวทาง:

```ts
const defaults = { retryPolicy: { maxAttempts: 3, initialInterval: 1 } };
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
Retrying task "b" after 366.35ms (attempt 1) after Error: Error: b ล้ม
Retrying task "b" after 51.31ms (attempt 2) after Error: Error: b ล้ม
Retrying task "a" after 581.85ms (attempt 1) after Error: Error: a ล้ม
Retrying task "a" after 424.40ms (attempt 2) after Error: Error: a ล้ม
{ attempts: { a: 3, b: 3, strict: 1 }, failure: 'strict ล้ม' }
✅ a และ b ล้มสองครั้งแต่ใช้ค่าเริ่มต้น (ลองสูงสุด 3): ถูกลองจนสำเร็จ
✅ strict ตั้งทับเป็นลองครั้งเดียว: ล้มแล้วจบ ไม่ลองใหม่
```

สิ่งที่ได้: ตั้งนโยบายกลางของ graph และยกเว้นเป็นรายตัว

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ระดับ | ตัวอย่าง | ผล |
|---|---|---|
| ค่าเริ่มต้นของ graph | `setNodeDefaults({ retryPolicy: { maxAttempts: 3, initialInterval: 1 } })` | ทุก node ลองซ้ำได้สูงสุด 3 ครั้ง |
| ตั้งทับต่อ node | `{ retryPolicy: { maxAttempts: 1 } }` | node นั้นไม่ลองซ้ำ เช่น node ที่ตัดเงิน |

## ข้อควรจำ

- นโยบายกลางที่ผิดกระทบทุก node ตรวจให้ดีก่อนใช้
- node ที่ทำสิ่งซ้ำไม่ได้ (เช่นตัดเงิน) ควรตั้ง `maxAttempts: 1` เอง

## ลองต่อใน playground

รัน `pnpm play 4-03` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `defaults.ts`](./solution/defaults.ts) · ไปต่อ [บท 4-04 ตรวจคำตอบของมนุษย์ด้วย zod (`responseSchema`)](../04-response-schema/README.md)
