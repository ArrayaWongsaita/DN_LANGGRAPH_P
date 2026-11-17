# บทที่ 08: system prompt

## เรียนอะไร
system prompt คือคำสั่งกำหนดบทบาทของ LLM ส่งเป็น SystemMessage ไว้เป็นข้อความแรก ตามด้วย HumanMessage ที่เป็นคำถาม

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว และรัน `npm run lesson 08` กับ LLM จริงแล้วเห็นผลลัพธ์

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `persona.ts`
2. เปิด `persona.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/08-system-prompt` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
