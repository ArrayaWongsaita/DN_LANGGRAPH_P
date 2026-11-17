# บทที่ 20: หลาย node ต่อกัน

## เรียนอะไร
node ต่อกันเป็นสายได้ ผลของ node แรกถูกเก็บใน state แล้ว node ถัดไปหยิบไปใช้ต่อ (ข้อควรจำ: ชื่อ node ห้ามซ้ำกับชื่อ field ใน state)

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `draftRefine.ts`
2. เปิด `draftRefine.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/20-sequence` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
