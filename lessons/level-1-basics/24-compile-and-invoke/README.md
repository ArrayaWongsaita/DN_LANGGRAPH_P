# บทที่ 24: compile และ invoke

## เรียนอะไร
.compile() เปลี่ยนแบบแปลนเป็น graph ที่รันได้ .invoke(input) รันหนึ่งครั้งแล้วคืน state สุดท้าย input ไม่ต้องครบทุก field (ที่เหลือใช้ค่าเริ่มต้น)

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `invokeDemo.ts`
2. เปิด `invokeDemo.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/24-compile-and-invoke` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
