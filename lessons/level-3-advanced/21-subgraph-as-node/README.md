# บทที่ 3-21 ใส่ subgraph เป็น node โดยตรง (ใช้ State ร่วมกัน)

## แนวคิด

ถ้า subgraph กับ graph แม่ **มี field ชื่อเดียวกัน** ใส่ subgraph เป็น node ได้เลยโดยไม่ต้องเขียนตัวแปลง:

```ts
new StateGraph(Parent).addNode("sub", subgraph)   // subgraph เป็น node ได้ตรง ๆ
```
- field ที่ชื่อตรงกันไหลเข้าไปให้ subgraph และผลไหลกลับออกมาเอง
- field ที่มีเฉพาะฝั่งใดฝั่งหนึ่งไม่ถูกส่งข้าม
- ในภาพกราฟของแม่ (บท 3-32) subgraph แสดงเป็น node เดียว

ใช้กับทีมงานที่แบ่งกัน: แต่ละทีมทำ subgraph ของตัวเอง แล้วแม่แค่ต่อสาย

## 1. ลองเติมช่องเดียว

เปิด [`asnode.ts`](./asnode.ts) แล้วเติมข้อ 1: ใส่ subgraph `normalize` เป็น node ของ graph แม่แล้วต่อ `START → normalize → measure → END` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-21
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี subgraph `normalize` (ตัดช่องว่างและทำตัวพิมพ์เล็ก) และ node `measure` ที่ใช้ State ร่วมกัน ให้แล้ว ขาดแค่การประกอบเข้ากับ graph แม่

โค้ดตามแนวทาง:

```ts
const pipeline = builder
  .addNode("normalize", normalize)
  .addEdge(START, "normalize")
  .addEdge("normalize", "measure")
  .addEdge("measure", END)
  .compile();
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
{ text: 'hello world', length: 11 }
✅ subgraph ทำความสะอาดข้อความ (trim + lowercase)
✅ node ถัดไปเห็นผลของ subgraph (length = 11)
```

สิ่งที่ได้: ต่อ subgraph เข้า graph แม่เป็น node

## 3. ส่วนประกอบที่ใช้ในบทนี้

| เงื่อนไข | ผล |
|---|---|
| field ชื่อเดียวกันใน State ของแม่และลูก | ไหลเข้า subgraph และไหลผลกลับออกมาเอง ไม่ต้องเขียนตัวแปลง |
| field ชื่อไม่ตรงกัน | ต้องเรียกใน node แล้วแปลงเอง (บท 3-20) |
| ชื่อ node กับชื่อ field | ต้องไม่ซ้ำกัน |

## ข้อควรจำ

- ชื่อ field ต้องตรงกัน เพราะเป็นสัญญาของการส่งค่า
- ตั้งชื่อ node ไม่ซ้ำกับชื่อ field เหมือนเดิม

## ลองต่อใน playground

รัน `pnpm play 3-21` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `asnode.ts`](./solution/asnode.ts) · ไปต่อ [บท 3-22 subgraph กับ checkpointer และ interrupt](../22-subgraph-checkpointer/README.md)
