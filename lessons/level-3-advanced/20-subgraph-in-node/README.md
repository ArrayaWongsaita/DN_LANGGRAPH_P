# บทที่ 3-20: subgraph เรียกใน node (คนละ State)

## แนวคิด
graph ที่เสร็จแล้วใช้เป็น **ชิ้นส่วน** ของ graph ใหญ่ได้ เรียกว่า subgraph วิธีแรกที่ยืดหยุ่นที่สุดคือ **เรียกมันข้างใน node** เหมือนเรียกฟังก์ชัน เหมาะเมื่อ subgraph กับ graph แม่มี **State คนละหน้าตา** (เช่นแม่มี `doc` ส่วนลูกใช้ `text`) เราเองเป็นคนแปลงเข้า-ออก:

```ts
.addNode("callCounter", async (state) => {
  const result = await counter.invoke({ text: state.doc }); // แปลง doc → text
  return { count: result.wc };                              // แปลงผล wc → count
})
```
ข้อดี: subgraph ไม่ต้องรู้จัก State ของแม่ นำกลับมาใช้ซ้ำในที่อื่นได้ ข้อเสีย: ภาพกราฟของแม่ไม่เห็นข้างใน

## ดูตัวอย่าง
`insidenode.ts` มี subgraph `counter` (นับคำ) ให้แล้ว ขาด node ในแม่ที่เรียกใช้

## โจทย์
เติม 1 ข้อ แล้วรัน:

    pnpm test:lesson 3-20

## คุณทำได้แล้ว
- ใช้ graph หนึ่งเป็นชิ้นส่วนของอีก graph โดยแปลง State เอง

## ข้อควรจำ
- ชื่อ node ของแม่ต้องไม่ซ้ำกับชื่อ field ใน State (ที่นี่ field ชื่อ `count` จึงตั้งชื่อ node ว่า `callCounter`)
- subgraph แยก State ของตัวเอง ค่าที่ไม่ได้แปลงจะไม่ไหลข้าม
- `invoke` ของ subgraph ใน node จะไม่เห็นความจำของแม่ เว้นแต่ส่งไปเอง

## บทถัดไป
บท 3-21: ใส่ subgraph เป็น node โดยตรง
