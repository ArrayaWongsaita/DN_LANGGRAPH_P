# บทที่ 18: edge, START และ END

## เรียนอะไร
edge คือลูกศรบอกลำดับ node เริ่มที่ START จบที่ END ถ้า node ใดไม่มีทางไปถึงจาก START graph จะ compile ไม่ผ่าน

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `twoSteps.ts`
2. เปิด `twoSteps.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/18-edges-start-end` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
