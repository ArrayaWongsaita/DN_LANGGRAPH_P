# บทที่ 02: ตั้งค่า API key

## เรียนอะไร
ทำไมต้องเก็บ key ไว้ในไฟล์ `.env` และอ่านค่ามาใช้ยังไง (ก่อนทำบทนี้: คัดลอก `.env.example` เป็น `.env` แล้วใส่ `OLLAMA_API_KEY` ที่สร้างจาก https://ollama.com/settings/keys)

## ผลลัพธ์ที่คาดหวัง
test เขียว และรัน `npm run lesson 02` แล้วเห็นข้อความว่าพบ key

## วิธีทำ
1. อ่านตัวอย่างในไฟล์ตัวอย่างของบท (ไฟล์ `.ts` ที่ไม่ใช่ `.test.ts`)
2. เปิดไฟล์ `.test.ts` แล้วเปลี่ยน `test.todo` เป็น `test` ทีละข้อ
3. รัน `npm test -- lessons/level-1-basics/02-env-and-api-key` ถ้าติดจริง ๆ ค่อยดูโฟลเดอร์ `solution/`
