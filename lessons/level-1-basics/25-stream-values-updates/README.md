# บทที่ 25: stream: values และ updates

## เรียนอะไร
stream ให้เห็น graph ทำงานทีละ step: mode updates ให้สิ่งที่แต่ละ node อัปเดต, mode values ให้ state ทั้งก้อนหลังแต่ละ step (ชิ้นแรกคือ input เริ่มต้น)

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `streamDemo.ts`
2. เปิด `streamDemo.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/25-stream-values-updates` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
