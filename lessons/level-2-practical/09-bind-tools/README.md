# บทที่ 2-09: ผูก tool เข้ากับ LLM (bindTools)

## แนวคิด
เมื่อมี tool แล้ว ต้อง **บอก LLM ว่ามี tool อะไรให้ใช้** ด้วย `bindTools`:

```ts
const llmWithTools = llm.bindTools([add, getWeather]);
const reply = await llmWithTools.invoke([new HumanMessage("2 บวก 3 เท่าไร")]);
```
สิ่งสำคัญที่ต้องเข้าใจ: **LLM ไม่ได้รัน tool เอง** มันแค่ตอบกลับมาเป็น `AIMessage` ที่มี `tool_calls` (ชื่อ tool + argument ที่ขอให้เรียก) เราต้องเป็นฝ่ายรัน tool แล้วเอาผลส่งกลับไปให้มัน

```ts
reply.tool_calls // [{ name: "add", args: { a: 2, b: 3 }, id: "call_1" }]
```
ถ้า LLM เห็นว่าไม่ต้องใช้ tool `tool_calls` จะว่าง และ `reply.text` คือคำตอบตรง ๆ

## ดูตัวอย่าง
`bind.ts` มี 2 ฟังก์ชันที่ต้องเติม: ถาม LLM ที่ผูก tool แล้ว กับรัน tool call หนึ่งรายการ (ให้เราเป็นคนรัน)

## โจทย์
เติม 3 ข้อ แล้วรัน:

    pnpm test:lesson 2-09

## คุณทำได้แล้ว
- ผูก tool กับ LLM และอ่านคำขอเรียก tool จาก `tool_calls`
- รัน tool ตามคำขอ

## ข้อควรจำ
- `tool_calls` คือ "คำขอ" ไม่ใช่ "ผลลัพธ์"
- LLM เลือก tool จาก `description` ของ tool

## บทถัดไป
บท 2-10: `ToolNode` รัน tool call ให้เราอัตโนมัติ
