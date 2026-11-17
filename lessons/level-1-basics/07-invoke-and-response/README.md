# บทที่ 07: invoke และผลตอบกลับ

## เรียนอะไร
llm.invoke ส่งคำถามแล้วได้ AIMessage กลับมา ข้อความอยู่ใน .content ซึ่งบางครั้งเป็น string บางครั้งเป็น array ของ block จึงต้องดึงข้อความให้ถูก

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว และรัน `npm run lesson 07` กับ LLM จริงแล้วเห็นผลลัพธ์

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `replyText.ts`
2. เปิด `replyText.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/07-invoke-and-response` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
