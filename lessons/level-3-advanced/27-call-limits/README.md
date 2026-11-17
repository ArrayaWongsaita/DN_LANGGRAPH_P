# บทที่ 3-27: middleware จำกัดการเรียก (กันวนและกันค่าใช้จ่าย)

## แนวคิด
`createAgent` (บท 2-16) ปรับแต่งได้ด้วย **middleware**: ชิ้นส่วนที่เสียบเข้าไปคั่นวงวนของ agent เพื่อดัก/แก้/จำกัดบางขั้น (ก่อนเรียกโมเดล หลังเรียกโมเดล รอบการเรียก tool ฯลฯ) ใส่ผ่านตัวเลือก `middleware`:

```ts
createAgent({
  model, tools,
  middleware: [modelCallLimitMiddleware({ runLimit: 3, exitBehavior: "end" })],
})
```
สองตัวที่กันงบบานปลาย:
- **`modelCallLimitMiddleware`** จำกัดจำนวนครั้งที่เรียกโมเดลต่อการรัน 1 ครั้ง (`exitBehavior: "end"` เป็นค่าเริ่มต้น = จบอย่างนุ่มนวลพร้อมข้อความแจ้ง, `"error"` = โยน error)
- **`toolCallLimitMiddleware`** จำกัดจำนวนครั้งที่เรียก tool ค่าเริ่มต้น (`exitBehavior: "continue"`) เมื่อเกินจะตอบ ToolMessage บอกโมเดลว่าเรียกอีกไม่ได้แล้ว ทั้งสองตัวมี `threadLimit` (นับข้ามการรันของ thread เดียวกัน ต้องมี checkpointer) นอกเหนือจาก `runLimit`

เทียบกับ `recursionLimit` (บท 2-12): อันนั้นนับ step ของ graph แล้วโยน error ส่วนนี้นับสิ่งที่มีความหมายต่อค่าใช้จ่ายโดยตรง และเลือกวิธีจบได้

## ดูตัวอย่าง
`limits.ts` มีฟังก์ชันสร้าง agent สองแบบ ขาด middleware ของแต่ละแบบ

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 3-27

## คุณทำได้แล้ว
- จำกัดการเรียกโมเดลและ tool ด้วย middleware

## ข้อควรจำ
- ตั้งเพดานที่เหมาะกับงานจริงของคุณ (ทดลองดูค่าใช้จ่ายต่อการรัน)
- middleware หลายตัวทำงานต่อกันตามลำดับในอาร์เรย์

## บทถัดไป
บท 3-28: summarization middleware
