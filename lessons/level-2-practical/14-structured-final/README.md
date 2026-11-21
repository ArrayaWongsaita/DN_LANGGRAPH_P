# บทที่ 2-14 เก็บคำตอบสุดท้ายใน State ด้วย `withStructuredOutput()`

เมื่อ agent ตอบว่า “เชียงใหม่อากาศเย็น 22 องศา” หน้าจอหรือฐานข้อมูลอาจต้องใช้ `city`, `tempC` และ `summary` เป็นค่าคนละช่อง เพิ่ม node `format` หลัง agent ตอบเสร็จ ให้โมเดลอ่านประวัติแล้วคืนออบเจ็กต์ตาม schema เก็บไว้ใน `state.answer`

```text
agent ⇄ tools
  └── ตอบเสร็จ → format → END
                  └── เขียน state.answer
```

## 1. แปลงประวัติที่ agent ตอบเสร็จแล้ว

เปิด [`final.ts`](./final.ts) แล้วเติมข้อ 1 ให้ node `format` เรียก `formatter.invoke(input)` และคืน `{ answer: ผลที่ได้ }` ตัวอย่างเริ่มที่ node `format` พร้อมประวัติอากาศที่เตรียมไว้ จึงเรียกโมเดลจริงเฉพาะตอนจัดรูปแบบ ตั้งค่าโมเดลและ API key ตาม [บท 1-02](../../level-1-basics/02-llm-config/README.md) แล้วรันจากโฟลเดอร์หลัก

```sh
pnpm lesson 2-14
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
const AnswerSchema = z.object({ city: z.string(), tempC: z.number(), summary: z.string() });
const State = new StateSchema({ messages: MessagesValue, answer: AnswerSchema.optional() });

const graph = new StateGraph(State)
  .addNode("format", async (state) => {
    const formatter = llm.withStructuredOutput(AnswerSchema, { method: "functionCalling" });
    const input = [...state.messages, new HumanMessage("จัดคำตอบอากาศตาม schema โดยคงชื่อเมืองเดิม")];
    return { answer: await formatter.invoke(input) };
  })
  .addEdge(START, "format")
  .addEdge("format", END)
  .compile();
```

ตัวอย่างผลที่คาดหลังส่งประวัติเข้ากราฟ โมเดลอาจใช้คำใน `summary` ต่างกัน [ดูเฉลย](./solution/final.ts)

```text
{"city":"เชียงใหม่","tempC":22,"summary":"อากาศเย็น"}
✅ ได้ answer ที่ตรงกับ schema
✅ อ่านอุณหภูมิ 22 จากผล tool
✅ ประวัติยังครบ 4 ข้อความ
```

## 2. ตั้งชนิดของคำตอบและตัวเรียกโมเดล

| ค่า | ค่าที่ใช้ในบท | ใช้ทำอะไร |
|---|---|---|
| `AnswerSchema` | `city: z.string()`, `tempC: z.number()`, `summary: z.string()` | กำหนดชื่อและชนิดของ field ที่โปรแกรมจะอ่าน |
| `answer` ใน State | `AnswerSchema.optional()` | ทำให้เริ่มรันกราฟได้ตอนที่ยังไม่มีคำตอบ |
| `method` | `"functionCalling"` | ขอให้โมเดลสร้างข้อมูลตาม schema ผ่านกลไก tool calling |
| `formatter.invoke(input)` | รับประวัติพร้อมข้อความขอจัดรูปแบบ | คืนออบเจ็กต์คำตอบตาม schema ข้อความที่เพิ่มใน `input` ใช้กับการเรียกโมเดลครั้งนี้ |
| `return { answer }` | ออบเจ็กต์อัปเดต State | เขียนผลลง field `answer` และเก็บประวัติเดิมไว้ใน `messages` |

เมื่อนำไปต่อจาก [วง ReAct ในบท 2-11](../11-react-loop/README.md) ให้ส่งทางออกที่เดิมไป `END` เข้า `format` แล้วต่อ `format → END` รูปแบบนี้ใช้ `withStructuredOutput` จาก [บท 1-09](../../level-1-basics/09-structured-output/README.md) ใน node สุดท้ายของกราฟ

## 3. เปลี่ยนชนิดของค่าที่จะเก็บแล้วเทียบผล

ลองตรวจ schema ในเครื่องโดยไม่ใช้ API key แทนเนื้อหา [`playground.ts`](./playground.ts) ด้วยตัวอย่างนี้แล้วรัน `pnpm play 2-14`

```ts
import { z } from "zod";

const AnswerSchema = z.object({ city: z.string(), tempC: z.number(), summary: z.string() });
const candidate = { city: "เชียงใหม่", tempC: 22, summary: "อากาศเย็น" };

for (const answer of [candidate, { ...candidate, tempC: "22" }]) {
  const result = AnswerSchema.safeParse(answer);
  console.log(result.success, JSON.stringify(answer));
}
```

```text
true {"city":"เชียงใหม่","tempC":22,"summary":"อากาศเย็น"}
false {"city":"เชียงใหม่","tempC":"22","summary":"อากาศเย็น"}
```

`safeParse()` ตรวจชนิดและโครงสร้างของข้อมูล ถ้าใช้ค่าที่โมเดลสร้างในโปรแกรมจริง ให้ตรวจความถูกต้องของข้อมูลกับแหล่งที่มาด้วย

## การบ้าน

เพิ่ม `unit: z.literal("C")` ใน schema ของ playground แล้วรัน `pnpm play 2-14` เทียบคำตอบที่ไม่มี `unit` กับคำตอบที่ใส่ `unit: "C"` ให้เห็นผล `false` และ `true` ตามลำดับ

[บทก่อนหน้า 2-13 จัดการ tool error](../13-tool-errors/README.md) · [บทถัดไป 2-15 เลือกโมเดลตามสถานการณ์](../15-dynamic-model/README.md)
