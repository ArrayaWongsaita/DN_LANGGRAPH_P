# บทที่ 4-09: subagents (agent เป็น tool ของ agent หลัก)

## แนวคิด
เอกสาร LangChain แนะนำรูปแบบ multi-agent หลักไว้ห้าแบบ (subagents, handoffs, skills, router, custom workflow) บทนี้คือ **subagents**: agent หลักคุมการคุยกับผู้ใช้ และมอบงานเฉพาะทางให้ agent ย่อย **โดยมองมันเป็น tool**:

```
ผู้ใช้ ⇄ agent หลัก ──เรียก tool "ask_math"──▶ agent ย่อย (มี tool และ prompt ของตัวเอง)
                     ◀── ผลลัพธ์เป็นข้อความ ───
```
จุดเด่นคือ **context แยกกัน**: agent ย่อยเห็นแค่คำขอที่ส่งไป ไม่เห็นประวัติแชตทั้งหมดของ agent หลัก (ประหยัด token และไม่ปนความรู้) และ agent หลักเห็นแค่คำตอบสุดท้ายของลูกทีม

วิธีทำ: ห่อ agent ย่อยด้วย `tool(...)`:
```ts
tool(async ({ request }) => lastText(await sub.invoke({ messages: [new HumanMessage(request)] })),
     { name: "ask_math", description: "...", schema: z.object({ request: z.string() }) })
```
ใช้เมื่องานแยกเป็นโดเมนชัดเจน หรืออยากให้ทีมต่างคนต่างพัฒนา agent ย่อย ข้อเสียคือผู้ใช้คุยกับ agent ย่อยโดยตรงไม่ได้ (ถ้าต้องการให้ดู handoff บท 3-23)

## ดูตัวอย่าง
`subagents.ts` มี agent ย่อย `math` (ใช้ tool บวก) ให้แล้ว ขาดตัวห่อเป็น tool และการประกอบ agent หลัก

## โจทย์
เติม 2 ข้อ แล้วรัน:

    pnpm test:lesson 4-09

## คุณทำได้แล้ว
- สร้างทีม agent แบบหัวหน้ามอบงานผ่าน tool ที่แยก context กัน

## ข้อควรจำ
- คำอธิบายของ tool (`description`) คือสิ่งที่ agent หลักใช้ตัดสินใจ เขียนให้ชัด
- ส่งเฉพาะข้อมูลที่ลูกทีมจำเป็นต้องใช้ใน `request`

## บทถัดไป
บท 4-10: skills (โหลดความรู้ตามต้องการ)
