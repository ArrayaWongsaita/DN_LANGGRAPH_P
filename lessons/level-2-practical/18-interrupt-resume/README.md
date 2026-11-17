# บทที่ 2-18: หยุดรอมนุษย์ (interrupt) แล้วทำต่อ (resume)

## แนวคิด
บางงาน agent ไม่ควรตัดสินใจเอง (ลบข้อมูล ส่งเงิน ส่งอีเมล) เราอยากให้ graph **หยุดรอคนตอบ** แล้วทำต่อจากจุดเดิม นี่คือ human-in-the-loop ใน LangGraph ใช้ 2 อย่าง:

- ใน node เรียก `interrupt(ข้อมูลที่อยากแสดงให้คนเห็น)` graph จะหยุดตรงนั้นและเก็บ State ไว้ (**ต้องมี checkpointer** และ `thread_id`)
- ฝั่งภายนอกตอบกลับด้วย `new Command({ resume: คำตอบ })` ใน `invoke` ถัดไป (thread เดียวกัน) แล้วค่า `resume` จะกลายเป็น **ค่าที่ `interrupt(...)` คืนออกมา**

```ts
// node
const answer = interrupt({ question: "อนุมัติไหม?" }); // หยุดตรงนี้ รอบหน้าได้ค่า resume

// ภายนอก
const r = await graph.invoke(input, cfg);      // หยุด: r มี __interrupt__ (ตรวจด้วย isInterrupted(r))
await graph.invoke(new Command({ resume: "yes" }), cfg); // ทำต่อ
```
สังเกต: ตอน resume **node ที่หยุดไว้จะรันใหม่ตั้งแต่ต้น node** แต่คราวนี้ `interrupt` คืนค่าที่ resume มาแทนการหยุด (เรื่องนี้สำคัญ บท 2-21)

## ดูตัวอย่าง
`pause.ts` มี graph สองโหนด: `ask` (ขออนุมัติ) แล้ว `act` (ทำตามคำตอบ) ขาดการเรียก `interrupt` และการ resume

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 2-18

## คุณทำได้แล้ว
- หยุด graph เพื่อรอคน และทำต่อด้วย `Command({ resume })`

## ข้อควรจำ
- ไม่มี checkpointer = `interrupt` ใช้ไม่ได้
- ข้อมูลที่ส่งใน `interrupt(...)` ต้องแปลงเป็น JSON ได้ (ถูกเก็บลง checkpoint)
- ข้อมูลที่หยุดอยู่ดูได้จาก `r.__interrupt__[0].value` หรือ `getState().tasks[0].interrupts[0].value`

## บทถัดไป
บท 2-19: อนุมัติหรือปฏิเสธ แล้วแยกทางตามคำตอบ
