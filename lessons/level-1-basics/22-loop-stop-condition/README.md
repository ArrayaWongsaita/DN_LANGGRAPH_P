# บทที่ 22: loop และเงื่อนไขหยุด

## เรียนอะไร
edge ที่วนกลับ node เดิมทำให้เกิด loop ต้องมีเงื่อนไขหยุดเสมอ ไม่งั้นจะวนไม่จบ (ที่นี่: LLM ตอบ OK หรือครบ maxRounds)

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `refineLoop.ts`
2. เปิด `refineLoop.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/22-loop-stop-condition` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
