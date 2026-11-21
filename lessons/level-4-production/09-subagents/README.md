# บทที่ 4-09 subagents (agent เป็น tool ของ agent หลัก)

## แนวคิด

เอกสาร LangChain แนะนำรูปแบบ multi-agent หลักไว้ห้าแบบ (subagents, handoffs, skills, router, custom workflow) บทนี้คือ **subagents**: agent หลักคุมการคุยกับผู้ใช้ และมอบงานเฉพาะทางให้ agent ย่อย **โดยมองมันเป็น tool**:

```
ผู้ใช้ ⇄ agent หลัก ──เรียก tool "ask_math"──▶ agent ย่อย (มี tool และ prompt ของตัวเอง)
                     ◀── ผลลัพธ์เป็นข้อความ ───
```
จุดเด่นคือ **context แยกกัน**: agent ย่อยเห็นแค่คำขอที่ส่งไป ไม่เห็นประวัติแชตทั้งหมดของ agent หลัก (ประหยัด token และไม่ปนความรู้) และ agent หลักเห็นแค่คำตอบสุดท้ายของลูกทีม

วิธีทำ: ห่อ agent ย่อยด้วย `tool(...)`:
```ts
tool(async ({ request }) => {
       const r = await sub.invoke({ messages: [new HumanMessage(request)] });
       return r.messages[r.messages.length - 1].text;   // ข้อความสุดท้ายของ agent ย่อย
     },
     { name: "ask_math", description: "...", schema: z.object({ request: z.string() }) })
```
ใช้เมื่องานแยกเป็นโดเมนชัดเจน หรืออยากให้ทีมต่างคนต่างพัฒนา agent ย่อย ข้อเสียคือผู้ใช้คุยกับ agent ย่อยโดยตรงไม่ได้ (ถ้าต้องการให้ดู handoff บท 3-23)

## 1. ลองเติมช่องเดียว

เปิด [`subagents.ts`](./subagents.ts) แล้วเติมข้อ 1: ห่อ agent ย่อยเป็น tool ที่รับ `request` แล้วคืนข้อความสุดท้ายของ agent ย่อย รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เรียกโมเดลจริง ตั้ง provider และ API key ใน `.env` ตาม [บท 1-02](../../level-1-basics/02-llm-config/README.md) ก่อนรัน

```sh
pnpm lesson 4-09
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี agent ย่อย `math` (ใช้ tool บวก) และโค้ดประกอบ agent หลักให้แล้ว ขาดแค่ตัวห่อ

โค้ดตามแนวทาง:

```ts
return tool(
  async ({ request }: { request: string }) => {
    const r = await sub.invoke({ messages: [new HumanMessage(request)] });
    return r.messages[r.messages.length - 1].text;
  },
  { name, description, schema: z.object({ request: z.string() }) },
);
```

## 2. ผลที่ได้

ตัวอย่างผลที่รันจากเฉลย ข้อความจากโมเดลเปลี่ยนได้ทุกรอบ

```text
โมเดลจริงตอบ: ผู้เชี่ยวชาญด้านการคำนวณตอบว่า: **1 + 2 = 3** ครับ
✅ agent หลักมอบงานให้ agent ย่อย แล้วตอบผู้ใช้จากคำตอบของมัน
✅ agent หลักเห็นคำตอบสุดท้ายของลูกทีมเป็น ToolMessage
✅ context แยกกัน: agent ย่อยเห็นแค่คำขอ ไม่เห็นข้อความของผู้ใช้
✅ ใช้โมเดลจริงแล้วตอบผลบวก 3
```

สิ่งที่ได้: สร้างทีม agent แบบหัวหน้ามอบงานผ่าน tool ที่แยก context กัน

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วนของ tool | ค่า | หน้าที่ |
|---|---|---|
| `name` และ `description` | ชื่อกับคำอธิบายที่บอกว่า agent ย่อยทำอะไรได้ | ให้ agent หลักตัดสินใจเรียก |
| `schema` | `z.object({ request: z.string() })` | ข้อความที่ agent หลักส่งให้ agent ย่อย |
| ค่าที่คืน | ข้อความสุดท้ายของ agent ย่อย | agent หลักเห็นแค่ผลนี้ |

## ข้อควรจำ

- คำอธิบายของ tool (`description`) คือสิ่งที่ agent หลักใช้ตัดสินใจ เขียนให้ชัด
- ส่งเฉพาะข้อมูลที่ลูกทีมจำเป็นต้องใช้ใน `request`

## ลองต่อใน playground

รัน `pnpm play 4-09` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `subagents.ts`](./solution/subagents.ts) · ไปต่อ [บท 4-10 skills (โหลดความรู้ตามต้องการ)](../10-skills/README.md)
