# บทที่ 2-15: เลือกโมเดลและ tool ตามสถานการณ์

## แนวคิด
ไม่จำเป็นต้องใช้โมเดลใหญ่หรือ tool ทุกตัวกับทุกคำถาม:
- คำถามสั้น ๆ ง่าย ๆ ใช้โมเดลเล็ก/ถูก ส่วนคำถามยาวซับซ้อนใช้โมเดลใหญ่
- ให้ LLM เห็นเฉพาะ tool ที่เกี่ยวข้อง (tool น้อยลง = LLM เลือกผิดน้อยลง และ prompt สั้นลง)

เพราะ node ใน graph เป็นแค่ฟังก์ชัน เราจึงเลือกได้ **ตอนรัน** ว่าจะใช้ LLM ตัวไหนกับ tool ชุดไหน:

```ts
const model = pickModel(question, { cheap, strong });
const tools = pickTools(question, allTools);
const reply = await (tools.length ? model.bindTools(tools) : model).invoke(messages);
```
(ตัว `createAgent` ใช้แนวคิดเดียวกันผ่าน middleware ใน Level 3)

## ดูตัวอย่าง
`dynamic.ts` มี node ที่ใช้ฟังก์ชันเลือก 2 ตัว ซึ่งเป็นสิ่งที่ต้องเติม

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 2-15

## คุณทำได้แล้ว
- เลือกโมเดลและ tool แบบ dynamic ตามคำถาม

## ข้อควรจำ
- กติกาเลือกควรง่ายและทดสอบได้ (ฟังก์ชันธรรมดา)
- โมเดลสองตัวต้องใช้ tool ได้ทั้งคู่

## บทถัดไป
บท 2-16: `createAgent` ทางลัดที่ใช้ในงานจริง
