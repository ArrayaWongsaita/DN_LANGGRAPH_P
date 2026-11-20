# บทที่ 2-25 ให้โมเดลเห็นตัวอย่างคำตอบด้วย few-shot

เมื่อต้องการให้โมเดลจัดหมวดรีวิวเป็นคำว่า `บวก` หรือ `ลบ` เราใส่ตัวอย่างรีวิวพร้อมป้ายกำกับไว้ก่อนรีวิวจริงได้ เทคนิคนี้เรียกว่า few-shot บทนี้ใช้คลาสข้อความจาก [บท 1-06](../../level-1-basics/06-system-and-history/README.md) เพื่อจัดตัวอย่างเป็นคู่ใน prompt

## 1. สร้าง prompt ที่มีตัวอย่างสองคู่

เปิด [`fewshot.ts`](./fewshot.ts) แล้วเติมข้อ 1 ให้แต่ละรายการใน `examples` กลายเป็น `HumanMessage(input)` ตามด้วย `AIMessage(output)` จากนั้นรันจากโฟลเดอร์หลักของโปรเจกต์เพื่อดูลำดับข้อความ ใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-25
```

```ts
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

const system = "จัดประเภทรีวิว ตอบเพียงคำว่า บวก หรือ ลบ";
const examples = [
  { input: "อาหารอร่อยมาก", output: "บวก" },
  { input: "รอนานจนอาหารเย็น", output: "ลบ" },
];
const review = "พนักงานใส่ใจ ประทับใจมาก";

const exampleMessages = examples.flatMap(({ input, output }) => [
  new HumanMessage(input),
  new AIMessage(output),
]);
const messages = [new SystemMessage(system), ...exampleMessages, new HumanMessage(review)];

for (const message of messages) {
  console.log(message.type, message.text);
}
```

```text
system จัดประเภทรีวิว ตอบเพียงคำว่า บวก หรือ ลบ
human อาหารอร่อยมาก
ai บวก
human รอนานจนอาหารเย็น
ai ลบ
human พนักงานใส่ใจ ประทับใจมาก
✅ ตัวอย่างทุกคู่เรียง human แล้ว ai พร้อมเนื้อหาตรงกัน
```

`flatMap` รวมข้อความจากทุกคู่เป็นอาร์เรย์เดียว จากนั้นวางรีวิวจริงไว้ท้ายสุด โมเดลจะตอบต่อจากบรรทัดนั้นเมื่อเรียก `await llm.invoke(messages)` ดูโค้ดพร้อมส่วนตรวจได้ใน [`solution/fewshot.ts`](./solution/fewshot.ts)

ถ้าทำ [บท 1-02](../../level-1-basics/02-llm-config/README.md) และตั้ง API key แล้ว รันคำสั่งนี้เพื่อส่ง prompt จริง สคริปต์จะพิมพ์คำตอบจากโมเดลเพิ่ม เช่น `คำตอบจากโมเดล บวก` ข้อความส่วนนี้ขึ้นกับโมเดลที่ตั้งไว้

```sh
LESSON_LIVE=1 pnpm lesson 2-25
```

## 2. ข้อความแต่ละชนิดทำหน้าที่อะไร

| ตำแหน่ง | ชนิดข้อความ | ค่าที่ใส่ |
|---|---|---|
| ต้นรายการ | `SystemMessage` | คำสั่งและป้ายกำกับที่ต้องการ เช่น `บวก` หรือ `ลบ` |
| ตรงกลาง | `HumanMessage` ตามด้วย `AIMessage` | รีวิวตัวอย่างและคำตอบตัวอย่าง วางต่อกันหนึ่งคู่ต่อรายการ |
| ท้ายรายการ | `HumanMessage` | รีวิวจริงที่ยังรอให้โมเดลจัดหมวด |

`llm.invoke(messages)` รับอาร์เรย์ข้อความทั้งหมด ตัวอย่างที่เพิ่มเข้ามาจึงใช้ input token ในทุกครั้งที่ส่ง prompt และมีผลต่อรูปแบบที่โมเดลเห็น [เอกสาร LangChain เรื่องข้อความ](https://docs.langchain.com/oss/javascript/langchain/messages)

## 3. เปลี่ยนจำนวนคู่แล้วเทียบ prompt

คัดลอกโค้ดหัวข้อ 1 ไปไว้ใน [`playground.ts`](./playground.ts) โดยเก็บ import ไว้ชุดเดียว เปลี่ยน `examples` แล้วรัน `pnpm play 2-25` ดูตำแหน่งของรีวิวจริงและจำนวนข้อความที่ส่ง

| `examples` | ลำดับ `message.type` | สิ่งที่โมเดลเห็นก่อนรีวิวจริง |
|---|---|---|
| `[]` | `system → human` | คำสั่งอย่างเดียว เรียกว่า zero-shot |
| เก็บเฉพาะคู่แรก | `system → human → ai → human` | ตัวอย่างป้าย `บวก` หนึ่งคู่ |
| เก็บทั้งสองคู่ | `system → human → ai → human → ai → human` | ตัวอย่างป้าย `บวก` และ `ลบ` |

ถ้าทดลองกับโมเดลจริง ให้ต่อโค้ดนี้ใน `playground.ts` แล้วใช้รีวิวเดียวกันทั้งตอนมีและไม่มีตัวอย่าง เช่น `รอนาน แต่อาหารอร่อยจนอยากกลับไป` ดูว่าคำตอบใช้ป้ายตามที่กำหนดหรือไม่ ผลจากรีวิวเดียวบอกพฤติกรรมของการเรียกครั้งนั้น

```ts
const { llm } = await import("@lessons/level-1-basics/02-llm-config/llm");
console.log((await llm.invoke(messages)).text.trim());
```

## บทถัดไป

[บท 2-26 ตั้ง temperature และอ่านการใช้ token](../26-params-usage/README.md)
