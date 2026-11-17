# บทที่ 2-07: เก็บความจำลงไฟล์ (SqliteSaver)

## แนวคิด
`MemorySaver` เก็บใน RAM: ปิดโปรแกรมแล้วหายหมด ถ้าอยากให้บอทจำข้ามการ "รีสตาร์ต" ต้องใช้ checkpointer ที่เก็บลงดิสก์ ตัวหนึ่งที่ง่ายคือ `SqliteSaver` (แพ็กเกจ `@langchain/langgraph-checkpoint-sqlite` ติดตั้งไว้แล้ว) เก็บลงไฟล์ SQLite:

```ts
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
const saver = SqliteSaver.fromConnString("memory.db"); // ชื่อไฟล์ (หรือ ":memory:" = RAM)
const graph = builder.compile({ checkpointer: saver });
```
ขอให้ **ชื่อไฟล์และ `thread_id` เดิม** แล้วบอทจะอ่านประวัติเดิมกลับมาได้ แม้จะสร้าง graph ใหม่ทั้งตัว (เหมือนรีสตาร์ตโปรแกรม)

## ดูตัวอย่าง
`persistent.ts` มี graph และ helper `chat` ที่ขาดสองจุด: การสร้าง saver จากไฟล์ และการติด saver เข้ากับ graph

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 2-07

## คุณทำได้แล้ว
- เก็บความจำข้ามการรีสตาร์ตด้วย `SqliteSaver`

## ข้อควรจำ
- ไฟล์ `.db` เก็บบทสนทนาจริงของผู้ใช้ ห้าม commit ขึ้น git
- งานจริงที่มีหลายเซิร์ฟเวอร์มักใช้ฐานข้อมูลกลาง (เช่น Postgres) ผ่าน checkpointer ตัวอื่น แต่รูปแบบการใช้เหมือนกัน

## บทถัดไป
บท 2-08: โปรเจกต์เล็กรวมสิ่งที่เรียนมา
