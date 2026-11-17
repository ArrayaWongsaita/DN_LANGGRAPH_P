# บทที่ 4-24: เก็บความจำถาวรด้วย Postgres

## แนวคิด
`MemorySaver` หายเมื่อรีสตาร์ต และ `SqliteSaver` (บท 2-07) เหมาะกับเครื่องเดียว งานจริงที่มีหลายเซิร์ฟเวอร์ใช้ **Postgres** ผ่าน `@langchain/langgraph-checkpoint-postgres`:

```ts
const saver = PostgresSaver.fromConnString("postgresql://user:pass@localhost:5432/mydb");
await saver.setup();                         // สร้างตารางของ checkpoint (ทำครั้งเดียวต่อฐานข้อมูล)
const graph = builder.compile({ checkpointer: saver });
```
- สลับ checkpointer ได้โดยไม่แก้ตัว graph เพราะทุกตัวใช้อินเทอร์เฟซเดียวกัน จึงเขียนฟังก์ชันสร้าง graph ให้ **รับ checkpointer เป็นพารามิเตอร์** แล้วตอนทดสอบส่ง `MemorySaver` ตอนใช้จริงส่ง `PostgresSaver`
- `thread_id` ไม่ควรยาวเกินไป (ที่ตั้งไว้ในบทนี้คือเพดาน 255 ตัวอักษรตามธรรมเนียมของคอร์ส ไม่ใช่ข้อจำกัดของ Postgres) ถ้าอาจยาวกว่านั้น (เช่นต่อจากหลายส่วน) ให้ย่อด้วย hash
- เปิดการเชื่อมต่อแล้วต้องปิดเมื่อจบโปรแกรม (`await saver.end()`)
- สร้าง `PostgresSaver` ยัง **ไม่เชื่อมต่อ** จนกว่าจะใช้งานจริง ตัวตรวจของบทนี้จึงไม่ต้องมีฐานข้อมูล ส่วน `run.ts` ใช้ฐานข้อมูลจริงจาก `DATABASE_URL` ใน `.env` (ฐานข้อมูล Postgres ในเครื่องของคุณ)

## ดูตัวอย่าง
`persist.ts` มีแอปแชตง่าย ๆ ขาด 3 จุด: ฟังก์ชันสร้าง saver จากลิงก์เชื่อมต่อ, การรับ checkpointer เข้า graph, และการย่อ `thread_id` ที่ยาวเกิน

## โจทย์
เติม 3 ข้อ แล้วรัน:

    pnpm test:lesson 4-24

จากนั้นลองกับ Postgres จริง (ตั้ง `DATABASE_URL` ใน `.env` ก่อน เช่น `postgresql://user:pass@localhost:5432/mydb`):

    pnpm lesson 4-24

## คุณทำได้แล้ว
- ทำให้ความจำของ agent รอดจากการรีสตาร์ตและใช้ร่วมกันหลายเซิร์ฟเวอร์ได้

## ข้อควรจำ
- ตั้งนโยบายลบ checkpoint เก่า ฐานข้อมูลจะโตตามจำนวนรอบสนทนา
- ห้าม commit ลิงก์เชื่อมต่อที่มีรหัสผ่าน (เก็บใน `.env` เท่านั้น)

## บทถัดไป
บท 4-25: โครงสร้างโปรเจกต์และการรันด้วย `langgraph dev`
