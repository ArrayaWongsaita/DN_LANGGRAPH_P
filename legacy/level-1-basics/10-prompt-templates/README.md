# บทที่ 10: prompt template

## เรียนอะไร
prompt template คือข้อความที่มีช่องว่าง {ตัวแปร} ให้เติมทีหลัง ใช้ซ้ำได้หลายครั้ง และ .pipe(llm) ต่อเข้ากับ LLM ได้เลย

## ผลลัพธ์ที่คาดหวัง
ทั้ง 3 ข้อขึ้นสีเขียว

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ `translatePrompt.ts`
2. เปิด `translatePrompt.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/10-prompt-templates` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
