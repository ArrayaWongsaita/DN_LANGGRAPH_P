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
`bind.ts` ขาด 3 จุด: ผูก tool ให้ LLM, ถามแล้วรับ `AIMessage` ที่ขอเรียก tool และรัน tool ตามที่ขอ (เราเป็นคนรัน)

## โจทย์
เติม 3 ข้อ (ค้นหา `// 👉 ข้อ N` ในไฟล์) แล้วรัน:

    pnpm lesson 2-09

สคริปต์จะพิมพ์ผล แล้วท้ายไฟล์มีส่วนตรวจที่แสดง ✅/❌ (ไม่ต้องแก้และไม่ต้องอ่านก็ได้)

## คุณทำได้แล้ว
- ผูก tool กับ LLM และอ่านคำขอเรียก tool จาก `tool_calls`
- รัน tool ตามคำขอ

## ข้อควรจำ
- `tool_calls` คือ "คำขอ" ไม่ใช่ "ผลลัพธ์"
- LLM เลือก tool จาก `description` ของ tool

## บทถัดไป
บท 2-10: `ToolNode` รัน tool call ให้เราอัตโนมัติ
