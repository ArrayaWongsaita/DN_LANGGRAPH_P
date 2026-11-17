# บทที่ 04: message object (คำตอบของ LLM คืออะไรกันแน่)

## แนวคิด
บทที่แล้ว `llm.invoke("...")` คืนบางอย่างที่ไม่ใช่ string ธรรมดา สิ่งนั้นคือ **message** (ข้อความหนึ่งก้อน) LangChain แยกข้อความตาม "ใครพูด":

| คลาส | `type` | ใครพูด |
|---|---|---|
| `HumanMessage` | `human` | ผู้ใช้ (เรา) |
| `AIMessage` | `ai` | LLM |
| `SystemMessage` | `system` | คำสั่งตั้งต้นถึง LLM (บทหน้า) |

คำตอบจาก `invoke` จึงเป็น `AIMessage` ซึ่งมีหลายส่วน ที่ใช้บ่อย:
- `.text` ข้อความล้วน (ใช้อันนี้เป็นหลัก)
- `.content` เนื้อหาดิบ บางโมเดล (เช่นโมเดลที่ "คิดก่อนตอบ") ส่งเป็นหลายก้อน จึงไม่ควรเอา `content` ไปต่อสตริงตรง ๆ
- `.usage_metadata` จำนวน token ที่ใช้ (ใช้คิดค่าใช้จ่าย)

ตอนส่งเข้า `invoke` เราส่งเป็น string ก็ได้ (LangChain แปลงเป็น `HumanMessage` ให้) หรือส่งเป็น **array ของ message** ซึ่งเป็นรูปแบบที่ทุกบทต่อจากนี้ใช้:

```ts
await llm.invoke([new HumanMessage("สวัสดี")]);
```

## ดูตัวอย่าง
`describeReply.ts` ส่งคำถามในรูป `HumanMessage` แล้วสรุปว่าคำตอบเป็นข้อความชนิดไหน และเนื้อหาคืออะไร

## โจทย์
เติม 2 ช่องใน `describeReply.ts` แล้วรัน:

    pnpm test:lesson 04

จากนั้นรัน `pnpm lesson 04` แล้วอ่านผลที่พิมพ์ออกมา สังเกตว่า `content`, `text` และ `usage_metadata` หน้าตาต่างกันอย่างไรกับโมเดลที่คุณใช้

## เทียบกับตอนใช้ fetch (บท 0-03)
ตอน `fetch` คำตอบคือ JSON ธรรมดา และ message คือ object `{ role, content }` ที่เราเขียนเอง ตอนนี้ LangChain มีคลาส `HumanMessage` / `AIMessage` / `SystemMessage` ที่รู้จักชนิดของตัวเอง (`.type`) และมี `.text` ที่ดึงข้อความให้ แม้โมเดลจะส่ง `content` เป็นหลายก้อน รวมถึงเก็บ `usage_metadata` ไว้ให้

## คุณทำได้แล้ว
- บอกได้ว่า message มีชนิดอะไรบ้างและต่างกันอย่างไร
- ส่งข้อความเข้า LLM ในรูป array ของ message
- อ่าน `.text` และรู้ว่า `.content` อาจไม่ใช่ string ล้วน

## ข้อควรจำ
- ใช้ `.text` เมื่ออยากได้ข้อความ
- `invoke` รับได้ทั้ง string และ array ของ message
- คำตอบของ LLM คือ `AIMessage` เสมอ

## บทถัดไป
บทที่ 05 จะใช้ message หลายชนิดรวมกัน: คำสั่งตั้งต้น (system) และประวัติการคุย
