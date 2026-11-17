# บทที่ 19: node ที่เรียก LLM

## เรียนอะไร
node เรียก LLM ได้เหมือนฟังก์ชันทั่วไป เราส่ง llm เข้าไปเป็นพารามิเตอร์ (ไม่ import ในไฟล์) เพื่อสลับเป็น fakeLLM ตอน test ได้

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว และรัน `npm run lesson 19` กับ LLM จริงแล้วเห็นผลลัพธ์

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `answerNode.ts`
2. เปิด `answerNode.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/19-llm-node` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
