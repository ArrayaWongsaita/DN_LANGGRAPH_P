# บทที่ 4-02 errorHandler (ชดเชยเมื่อ node ล้มเหลว)

## แนวคิด

เมื่อ node ล้มเหลว (และลองใหม่จนหมดแล้ว) คุณอาจไม่ต้องการให้ทั้ง graph พัง แต่ต้อง **ชดเชย** เช่นคืนเงินหลังตัดบัตรไม่สำเร็จ LangGraph ให้ใส่ `errorHandler` ต่อ node: ฟังก์ชันที่ได้ State กับ `NodeError` (`error.node` ชื่อ node, `error.error` ตัว error) แล้วคืน `Command` เพื่ออัปเดต State และเลือกทางไปต่อ:

```ts
.addNode("charge", charge, {
  retryPolicy: { maxAttempts: 3 },
  errorHandler: (state, error: NodeError) =>
    new Command({ update: { status: `ชดเชย:${error.node}` }, goto: "compensate" }),
  ends: ["compensate"],     // ปลายทางที่ Command ไปได้ (เหมือนบท 3-02)
})
```
- handler ทำงาน **หลังลองใหม่หมดแล้ว** (หรือทันทีถ้าไม่มี `retryPolicy`)
- `interrupt` ไม่ผ่าน handler
- ถ้า handler โยน error เอง error นั้นจะพา graph ล้มตามปกติ
- มีเฉพาะ `StateGraph.addNode` (ไม่มีใน `task`/`entrypoint`)

## 1. ลองเติมช่องเดียว

เปิด [`handler.ts`](./handler.ts) แล้วเติมข้อ 1: เขียน `errorHandler` ที่คืน `Command` ไปที่ node `compensate` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 4-02
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี node `charge` ที่ล้มเหลวเสมอ และ node `compensate` ให้แล้ว ขาดแค่ตัว handler ที่ชดเชย

โค้ดตามแนวทาง:

```ts
return new Command({ update: { status: `ชดเชยหลัง ${error.node}: ${error.error.message}` }, goto: "compensate" });
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
Retrying task "charge" after 614.06ms (attempt 1) after Error: Error: บัตรถูกปฏิเสธ
Retrying task "charge" after 789.94ms (attempt 2) after Error: Error: บัตรถูกปฏิเสธ
คืนเงิน (ชดเชยหลัง charge: บัตรถูกปฏิเสธ) | charge ถูกรัน 3 ครั้ง
✅ handler เดี่ยว ๆ: สั่งไป compensate พร้อมเหตุผลที่มีชื่อ node และข้อความ error
✅ node ล้มเหลว: graph ไม่พัง แต่ไปทางชดเชยพร้อมเหตุผล
✅ handler ทำงานหลังลองใหม่ครบ 3 ครั้งแล้วเท่านั้น
```

สิ่งที่ได้: เปลี่ยนความล้มเหลวของ node เป็นเส้นทางชดเชยที่ควบคุมได้

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ค่าใน `NodeError` | ความหมาย |
|---|---|
| `error.node` | ชื่อ node ที่ล้มเหลว |
| `error.error` | ตัว error ที่โยนออกมา |
| ค่าที่ handler คืน | `Command({ update, goto })` เพื่อชดเชยและไปต่อที่ node ที่เลือก |

## ข้อควรจำ

- retry ก่อน แล้วค่อย handler: อย่าทำสิ่งที่ซ้ำไม่ได้ใน node ที่ถูก retry
- การชดเชยเองก็ต้องออกแบบให้ทำซ้ำได้อย่างปลอดภัย

## ลองต่อใน playground

รัน `pnpm play 4-02` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `handler.ts`](./solution/handler.ts) · ไปต่อ [บท 4-03 ค่าเริ่มต้นของทุก node (`setNodeDefaults`)](../03-node-defaults/README.md)
