# บทที่ 3-21: ใส่ subgraph เป็น node โดยตรง (ใช้ State ร่วมกัน)

## แนวคิด
ถ้า subgraph กับ graph แม่ **มี field ชื่อเดียวกัน** ใส่ subgraph เป็น node ได้เลยโดยไม่ต้องเขียนตัวแปลง:

```ts
new StateGraph(Parent).addNode("sub", subgraph)   // subgraph เป็น node ได้ตรง ๆ
```
- field ที่ชื่อตรงกันไหลเข้าไปให้ subgraph และผลไหลกลับออกมาเอง
- field ที่มีเฉพาะฝั่งใดฝั่งหนึ่งไม่ถูกส่งข้าม
- ภาพกราฟ (`drawMermaid({ xray: true })`) เปิดดูข้างใน subgraph ได้

ใช้กับทีมงานที่แบ่งกัน: แต่ละทีมทำ subgraph ของตัวเอง แล้วแม่แค่ต่อสาย

## ดูตัวอย่าง
`asnode.ts` มี subgraph `normalize` (ตัดช่องว่างและทำตัวพิมพ์เล็ก) ให้แล้ว ขาดการประกอบเข้ากับแม่

## โจทย์
เติม 1 ข้อ แล้วรัน:

    pnpm test:lesson 3-21

## คุณทำได้แล้ว
- ต่อ subgraph เข้า graph แม่เป็น node

## ข้อควรจำ
- ชื่อ field ต้องตรงกัน เพราะเป็นสัญญาของการส่งค่า
- ตั้งชื่อ node ไม่ซ้ำกับชื่อ field เหมือนเดิม

## บทถัดไป
บท 3-22: subgraph กับ checkpointer และ interrupt
