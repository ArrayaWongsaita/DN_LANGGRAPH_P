# บทที่ 4-02: errorHandler (ชดเชยเมื่อ node ล้มเหลว)

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

## ดูตัวอย่าง
`handler.ts` มี node `charge` ที่ล้มเหลวเสมอ (นับจำนวนครั้งที่ถูกเรียก) และ node `compensate` ขาดตัว handler และการติดตั้ง

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 4-02

## คุณทำได้แล้ว
- เปลี่ยนความล้มเหลวของ node เป็นเส้นทางชดเชยที่ควบคุมได้

## ข้อควรจำ
- retry ก่อน แล้วค่อย handler: อย่าทำสิ่งที่ซ้ำไม่ได้ใน node ที่ถูก retry
- การชดเชยเองก็ต้องออกแบบให้ทำซ้ำได้อย่างปลอดภัย

## บทถัดไป
บท 4-03: ค่าเริ่มต้นของทุก node
