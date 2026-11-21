# บทที่ 3-27 middleware จำกัดการเรียก (กันวนและกันค่าใช้จ่าย)

## แนวคิด

`createAgent` (บท 2-16) ปรับแต่งได้ด้วย **middleware**: ชิ้นส่วนที่เสียบเข้าไปคั่นวงวนของ agent เพื่อดัก/แก้/จำกัดบางขั้น (ก่อนเรียกโมเดล หลังเรียกโมเดล รอบการเรียก tool ฯลฯ) ใส่ผ่านตัวเลือก `middleware`:

```ts
createAgent({
  model, tools,
  middleware: [modelCallLimitMiddleware({ runLimit: 3, exitBehavior: "end" })],
})
```
สองตัวที่กันงบบานปลาย:
- **`modelCallLimitMiddleware`** จำกัดจำนวนครั้งที่เรียกโมเดลต่อการรัน 1 ครั้ง (`exitBehavior: "end"` เป็นค่าเริ่มต้น = จบอย่างนุ่มนวลพร้อมข้อความแจ้ง, `"error"` = โยน error)
- **`toolCallLimitMiddleware`** จำกัดจำนวนครั้งที่เรียก tool ค่าเริ่มต้น (`exitBehavior: "continue"`) เมื่อเกินจะตอบ ToolMessage บอกโมเดลว่าเรียกอีกไม่ได้แล้ว ทั้งสองตัวมี `threadLimit` (นับข้ามการรันของ thread เดียวกัน ต้องมี checkpointer) นอกเหนือจาก `runLimit`

เทียบกับ `recursionLimit` (บท 2-12): อันนั้นนับ step ของ graph แล้วโยน error ส่วนนี้นับสิ่งที่มีความหมายต่อค่าใช้จ่ายโดยตรง และเลือกวิธีจบได้

## 1. ลองเติมช่องเดียว

เปิด [`limits.ts`](./limits.ts) แล้วเติมข้อ 1: สร้าง agent ที่จำกัดจำนวนครั้งเรียกโมเดลด้วย `modelCallLimitMiddleware` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เรียกโมเดลจริง ตั้ง provider และ API key ใน `.env` ตาม [บท 1-02](../../level-1-basics/02-llm-config/README.md) ก่อนรัน

```sh
pnpm lesson 3-27
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มีคำถามที่ต้องใช้ tool สองครั้งต่อกัน และ agent อีกตัวที่จำกัดจำนวนครั้งเรียก tool ด้วย `toolCallLimitMiddleware` ให้แล้ว ขาดแค่ agent ที่จำกัดการเรียกโมเดล

โค้ดตามแนวทาง:

```ts
const modelLimited = createAgent({
  model: llm,
  tools,
  middleware: [modelCallLimitMiddleware({ runLimit: 1, exitBehavior: "end" })],
});
```

## 2. ผลที่ได้

ตัวอย่างผลที่รันจากเฉลย ข้อความจากโมเดลเปลี่ยนได้ทุกรอบ

```text
[
  'human: ใช้ tool add บวก 1 กับ 2 ก่อน แล้วเอาผลที่ได้ไปใช้ tool add บวก 10 อีก',
  'ai: ',
  'tool: 3',
  'ai: Model call limits exceeded: run level call limit reached with 1 model '
]
[
  'human: ใช้ tool add บวก 1 กับ 2 ก่อน แล้วเอาผลที่ได้ไปใช้ tool add บวก 10 อีก',
  "ai: I'll do this in two steps.",
  'tool: 3',
  'ai: ',
  'tool: Tool call limit exceeded. Do not make additional tool calls.'
]
✅ จำกัดโมเดล 1 ครั้ง: tool ถูกรันครั้งเดียว แล้ว agent จบอย่างนุ่มนวลด้วยข้อความแจ้งว่าเกินโควตา
✅ จำกัด tool 1 ครั้ง: tool รันจริงครั้งเดียว ครั้งที่สองถูกปฏิเสธ
```

สิ่งที่ได้: จำกัดการเรียกโมเดลและ tool ด้วย middleware

## 3. ส่วนประกอบที่ใช้ในบทนี้

| middleware | ตัวเลือกที่ใช้ | ผลเมื่อถึงเพดาน |
|---|---|---|
| `modelCallLimitMiddleware` | `{ runLimit: 1, exitBehavior: "end" }` | หยุดวงวนของ agent ทันที |
| `toolCallLimitMiddleware` | `{ runLimit: 1 }` | จำกัดจำนวนครั้งเรียก tool ต่อการรัน |

## ข้อควรจำ

- ตั้งเพดานที่เหมาะกับงานจริงของคุณ (ทดลองดูค่าใช้จ่ายต่อการรัน)
- middleware หลายตัวทำงานต่อกันตามลำดับในอาร์เรย์

## ลองต่อใน playground

รัน `pnpm play 3-27` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `limits.ts`](./solution/limits.ts) · ไปต่อ [บท 3-28 summarization middleware (ย่อประวัติให้อัตโนมัติ)](../28-summarization-middleware/README.md)
