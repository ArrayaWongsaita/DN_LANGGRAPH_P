# บทที่ 5-12: Functional API ให้ลึกขึ้น

## แนวคิด
บท 3-31 สอน `entrypoint` + `task` พื้นฐาน บทนี้เพิ่ม 4 เครื่องมือที่ทำให้เวิร์กโฟลว์แบบฟังก์ชัน "ใช้งานจริงได้":

**1. ความจำข้ามรอบ (`getPreviousState` + `entrypoint.final`)**
ถ้ามี checkpointer, การ `invoke` thread เดิมอีกครั้งอ่านค่าที่บันทึกไว้รอบก่อนได้ และแยก "ค่าที่คืนให้ผู้เรียก" ออกจาก "ค่าที่เก็บไว้":

```ts
const wf = entrypoint({ name: "totals", checkpointer }, async (inc: number) => {
  const total = (getPreviousState<number>() ?? 0) + inc;
  return entrypoint.final({ value: total, save: total });   // value = คืนให้ผู้เรียก, save = เก็บไว้รอบหน้า
});
```
**2. `interrupt` ใน entrypoint:** หยุดรออนุมัติแล้ว `Command({ resume })` ต่อ จุดสำคัญ: ตอน resume ฟังก์ชัน **รันใหม่ตั้งแต่บรรทัดแรก** แต่ `task` ที่เสร็จแล้วจะ **ไม่รันซ้ำ** (ใช้ผลที่บันทึกไว้) จึงต้องใส่งานที่มีผลข้างเคียง (จองของ, ตัดเงิน, ส่งอีเมล) ไว้ใน `task` เสมอ ไม่ใช่ตรง ๆ ใน entrypoint
**3. สตรีมความคืบหน้า (`getWriter`)** ส่งข้อมูลออกทาง `streamMode: "custom"` ระหว่างทำงาน
**4. retry ต่อ task:** `task({ name, retry: { maxAttempts, initialInterval } }, fn)` ลองใหม่เฉพาะงานที่ล้ม (บท 3-06 ทำกับ node)

## ดูตัวอย่าง
`workflow.ts` มี task `reserve` / `ship` (นับจำนวนครั้งที่ถูกเรียกใน `calls`) ให้แล้ว ขาด 4 ส่วน

## โจทย์
เติม 4 ข้อ แล้วรัน:

    pnpm test:lesson 5-12

## คุณทำได้แล้ว
- เขียนเวิร์กโฟลว์แบบฟังก์ชันที่จำข้ามรอบ รออนุมัติ รายงานความคืบหน้า และลองใหม่เมื่อล้ม

## ข้อควรจำ
- โค้ดใน entrypoint ที่อยู่นอก `task` จะรันซ้ำตอน resume: ห้ามมีผลข้างเคียงหรือค่าสุ่ม/เวลาที่ผลต้องคงที่ (ใส่ใน task)
- ค่าที่ `task` คืนต้องแปลงเป็น JSON ได้
- Graph API ยังเป็นตัวเลือกแรกสำหรับ agent ที่ซับซ้อน (เห็นภาพและตรวจสอบได้ง่ายกว่า)

## บทถัดไป
Part 22: SQL agent (บท 5-13)
