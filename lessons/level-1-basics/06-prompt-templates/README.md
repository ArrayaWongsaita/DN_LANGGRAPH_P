# บทที่ 06: prompt template (แม่แบบข้อความ)

## แนวคิด
บทที่แล้วเราประกอบข้อความด้วยมือ ถ้าต้องต่อสตริงหลายที่จะรกและพลาดง่าย LangChain มีเครื่องมือมาตรฐานชื่อ **`ChatPromptTemplate`**: เขียนแม่แบบครั้งเดียว เว้นช่องไว้ด้วย `{ชื่อช่อง}` แล้วเติมค่าตอนใช้

```ts
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "แปลเป็นภาษา{language}"],
  ["human", "{text}"],
]);
//                        เติมค่า
// prompt.invoke({ language: "อังกฤษ", text: "สวัสดี" })  ──►  [SystemMessage, HumanMessage]
```

ของอีกอย่างที่ LangChain ให้มาคือ **`.pipe(...)`** ใช้ต่อสิ่งที่ทำงานต่อกันได้ให้เป็นสายเดียว (เรียกว่า chain):

```
{language, text} ──► prompt ──► llm ──► AIMessage
                  prompt.pipe(llm)
```
ทุกอย่างที่ต่อด้วย `.pipe` ใช้ `.invoke(...)` ได้เหมือนกัน หลักการนี้ (สิ่งที่ invoke ได้ต่อกันได้) คือแนวคิดเดียวกับที่ LangGraph ใช้ต่อไป

## ดูตัวอย่าง
`translate.ts` มีฟังก์ชัน `buildTranslatePrompt()` ที่ต้องคืนแม่แบบ (ให้คุณเขียน) และฟังก์ชัน `translate` ที่เอาแม่แบบไปต่อกับ `llm`

## โจทย์
เติม 2 ช่อง แล้วรัน:

    pnpm test:lesson 06

ข้อ 1 ให้แทน `return todo(1);` ด้วย `return ChatPromptTemplate.fromMessages([...]);` ลองเปลี่ยนภาษาปลายทางด้วย `pnpm lesson 06`

## คุณทำได้แล้ว
- สร้างแม่แบบข้อความที่เติมค่าได้ด้วย `ChatPromptTemplate`
- ต่อแม่แบบเข้ากับ LLM ด้วย `.pipe`
- ใช้แม่แบบเดียวซ้ำกับข้อมูลหลายชุด

## ข้อควรจำ
- ช่องในแม่แบบเขียนเป็น `{ชื่อ}` และต้องส่งค่าครบทุกช่องตอน invoke
- `prompt.pipe(llm)` คือสายที่เรียกด้วยค่าของช่อง
- ชื่อช่องต้องตรงกับ key ของ object ที่ส่งเข้า invoke

## บทถัดไป
บทที่ 07 จะดูคำตอบที่ทยอยออกมาทีละส่วน (streaming)
