# บทที่ 3-13: ดูประวัติ checkpoint

## แนวคิด
checkpointer ไม่ได้เก็บแค่ State ล่าสุด มันบันทึก **ภาพถ่าย (checkpoint) ทุก step** ของ thread เราย้อนดูได้ด้วย `getStateHistory`:

```ts
for await (const snapshot of graph.getStateHistory(config)) {
  snapshot.values   // State ณ ตอนนั้น
  snapshot.next     // node ที่จะรันต่อจากจุดนั้น ([] = จบ)
  snapshot.config   // config ที่ชี้ไปที่ checkpoint นี้ (เอาไปใช้ย้อนเวลาในบทหน้า)
}
```
รายการเรียงจาก **ใหม่ไปเก่า** (อันแรกคือสถานะล่าสุด อันสุดท้ายคือก่อนเริ่ม)

ใช้ทำอะไร: ตรวจว่า agent ตัดสินใจอย่างไรทีละขั้น (ดีบัก), ทำ audit, และเป็นฐานของการย้อนเวลา (บท 3-14)

## ดูตัวอย่าง
`history.ts` มี graph `a → b → c` ที่มีความจำ ขาดตัวดึงประวัติและตัวหา checkpoint ตามชื่อ node ที่จะรันต่อ

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 3-13

## คุณทำได้แล้ว
- อ่านประวัติทุก step ของ thread

## ข้อควรจำ
- ประวัติมาจาก checkpointer: ต้องมี checkpointer และ `thread_id`
- `next` บอก "ขั้นต่อไป" ไม่ใช่ขั้นที่เพิ่งทำ

## บทถัดไป
บท 3-14: ย้อนเวลา replay และ fork
