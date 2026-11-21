# บทที่ 3-05 context ตอนรัน (ค่าตั้งต้นที่ไม่ใช่ State)

## แนวคิด

บางค่าเป็น **ค่าแวดล้อมของการรัน** ไม่ใช่ข้อมูลที่ไหลระหว่าง node: ภาษาของผู้ใช้, รหัสผู้ใช้, ชื่อโมเดลที่ใช้ ใส่ใน State ก็ได้แต่จะปนกับข้อมูลงานและถูกบันทึกเป็น checkpoint ทุกครั้ง LangGraph จึงมี **context schema**:

```ts
const graph = new StateGraph(State, { context: z.object({ lang: z.string().optional() }) })
  .addNode("greet", (state, runtime) => ({ out: runtime.context?.lang === "en" ? "Hello" : "สวัสดี" }))
  ...
await graph.invoke(input, { context: { lang: "en" } });
```
- ประกาศชนิดของ context ตอนสร้าง graph
- node อ่านผ่าน `runtime.context` (อาร์กิวเมนต์ที่สองของ node)
- ผู้เรียกส่งมากับ `invoke` ไม่เข้า State จึงไม่ถูกเก็บใน checkpoint

## 1. ลองเติมช่องเดียว

เปิด [`context.ts`](./context.ts) แล้วเติมข้อ 1: ส่ง context schema เป็น options ตัวที่สองของ `StateGraph` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-05
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี State, node ที่อ่าน `runtime.context?.lang` และการเรียก graph สามแบบ (ส่ง `en`, ไม่ส่ง context และส่ง `th`) ให้แล้ว ขาดแค่การประกาศ context schema

โค้ดตามแนวทาง:

```ts
const builder = new StateGraph(State, { context: z.object({ lang: z.string().optional() }) });
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ en: 'Hello', th: 'สวัสดี', none: 'สวัสดี' }
✅ context lang = en ได้ Hello
✅ context lang = th ได้ สวัสดี
✅ ไม่ส่ง context ก็ใช้ค่าเริ่มต้น (สวัสดี)
```

สิ่งที่ได้: ส่งค่าแวดล้อมให้ node โดยไม่ผ่าน State

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ส่วน | ตัวอย่าง | ผล |
|---|---|---|
| context schema | `{ context: z.object({ lang: z.string().optional() }) }` | บอก graph ว่า `invoke` ส่ง context อะไรได้ |
| ส่ง context | `graph.invoke(input, { context: { lang: "en" } })` | node อ่านผ่าน `runtime.context` |
| ไม่ส่ง context | `graph.invoke(input)` | `runtime.context?.lang` เป็น `undefined` ใช้ค่าสำรองที่ node กำหนด |

## ข้อควรจำ

- context ถูกตรวจกับ schema ตอน `invoke`: field ที่บังคับ (ไม่ใช่ `.optional()`) แล้วผู้เรียกไม่ส่ง = ZodError ถ้าอยากให้ไม่ส่งได้ให้ใช้ `.optional()`
- ค่า default ของ zod ไม่ถูกเติมให้ใน node ให้ใช้ `?.` และกำหนดค่าสำรองเอง
- ข้อมูลลับ (เช่น API key) ส่งทาง context ก็ไม่ถูกบันทึกลง checkpoint

## ลองต่อใน playground

รัน `pnpm play 3-05` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `context.ts`](./solution/context.ts) · ไปต่อ [บท 3-06 retry policy ของ node](../06-retry-policy/README.md)
