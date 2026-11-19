# บทที่ 3-05: context ตอนรัน (ค่าตั้งต้นที่ไม่ใช่ State)

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

## ดูตัวอย่าง
`context.ts` ขาดการประกาศ context และการอ่านใน node สคริปต์เรียกด้วย context ต่างกันสามแบบ บทนี้ไม่ใช้ LLM

## โจทย์
เติม 2 ข้อ (ค้นหา `// 👉 ข้อ N` ในไฟล์) แล้วรัน:

    pnpm lesson 3-05

สคริปต์จะพิมพ์ผล แล้วท้ายไฟล์มีส่วนตรวจที่แสดง ✅/❌ (ไม่ต้องแก้และไม่ต้องอ่านก็ได้)

## คุณทำได้แล้ว
- ส่งค่าแวดล้อมให้ node โดยไม่ผ่าน State

## ข้อควรจำ
- context ถูกตรวจกับ schema ตอน `invoke`: field ที่บังคับ (ไม่ใช่ `.optional()`) แล้วผู้เรียกไม่ส่ง = ZodError ถ้าอยากให้ไม่ส่งได้ให้ใช้ `.optional()`
- ค่า default ของ zod ไม่ถูกเติมให้ใน node ให้ใช้ `?.` และกำหนดค่าสำรองเอง
- ข้อมูลลับ (เช่น API key) ส่งทาง context ก็ไม่ถูกบันทึกลง checkpoint

## บทถัดไป
บท 3-06: retry policy ของ node
