# บทที่ 3-22: subgraph กับ checkpointer และ interrupt

## แนวคิด
เมื่อ subgraph เป็น node ใน graph แม่ **checkpointer ของแม่ครอบคลุมข้างในด้วย** คุณไม่ต้องใส่ checkpointer ให้ subgraph:

- ใส่ checkpointer ที่ **graph แม่ตัวเดียว** ตอน `compile`
- ประวัติ, `getState`, `thread_id` ทำงานทั้งระบบ
- `interrupt` ที่อยู่ลึกใน subgraph ก็ **หยุดทั้งระบบ** และ `Command({ resume })` ที่ส่งเข้า graph แม่จะไปถึง subgraph เอง

```
แม่ (compile + MemorySaver)
 └ sub (ไม่ต้องมี checkpointer)
     └ ask: interrupt("ยืนยันไหม?")   ← หยุดตรงนี้ resume ผ่านแม่
```
(subgraph ยังตั้งความจำของตัวเองแยกได้ผ่านตัวเลือก checkpointer ตอน compile แต่กรณีส่วนใหญ่ใช้ของแม่ก็พอ และเรียบง่ายกว่า)

## ดูตัวอย่าง
`subcheck.ts` มี subgraph `confirm` ที่ถามยืนยันด้วย `interrupt` ใส่ใน graph แม่ ขาดการติด checkpointer ที่แม่และฟังก์ชัน resume

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 3-22

## คุณทำได้แล้ว
- หยุดและทำต่อ (human-in-the-loop) ผ่าน subgraph

## ข้อควรจำ
- ลืมใส่ checkpointer ที่แม่ = `interrupt` ใช้ไม่ได้
- ทุกอย่างของ thread (รวม subgraph) อยู่ใน checkpoint เดียวกัน

## บทถัดไป
บท 3-23: handoff ส่งต่อระหว่าง agent
