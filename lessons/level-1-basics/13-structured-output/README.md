# บทที่ 13: structured output

## เรียนอะไร
เราอยากได้คำตอบเป็นข้อมูลมีโครงสร้าง (ไม่ใช่ข้อความยาว) จึงขอให้ LLM ตอบเป็น JSON แล้วตรวจรูปร่างด้วย zod (Ollama Cloud ยังไม่รองรับ structured output แบบ native จึงใช้วิธีนี้)

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว และรัน `npm run lesson 13` กับ LLM จริงแล้วเห็นผลลัพธ์

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `extractPerson.ts`
2. เปิด `extractPerson.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/13-structured-output` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
