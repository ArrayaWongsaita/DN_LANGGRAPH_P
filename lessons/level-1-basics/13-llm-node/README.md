# บทที่ 1-13 เรียก LLM ใน Node

รับคำถามหนึ่งข้อแล้วให้ node เก็บข้อความที่โมเดลตอบลง State บทนี้นำ `llm.invoke()` จาก [บท 1-03](../03-first-llm-call/README.md) มาไว้ใน Graph ที่ต่อเส้นแบบ [บท 1-12](../12-edges/README.md)

## 1. ให้ Node ตอบคำถามจาก State

เปิด [`askGraph.ts`](./askGraph.ts) แล้วเติมข้อ 1 ให้ `ask` ส่ง `state.question` ไปยัง `llm.invoke()` รอผลด้วย `await` แล้วคืน `answer` จาก `reply.text` รันจากโฟลเดอร์หลักของโปรเจกต์หลังติดตั้ง dependencies ด้วย `pnpm install` ตัวอย่างใช้โมเดลจำลองในเครื่อง จึงรันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 1-13
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`fakeToolLLM` ในไฟล์จะคืนคำตอบตามรายการที่กำหนดไว้ ส่วน `app` สร้างจาก schema `State` และต่อ `START` → `ask` → `END` ไว้ให้แล้ว

```ts
const llm = fakeToolLLM([
  "LangGraph ใช้ต่อขั้นตอนที่อ่านและอัปเดต State ร่วมกัน",
  "node คือขั้นตอนที่อ่าน State และคืนค่าอัปเดต",
]);

async function ask(state: typeof State.State): Promise<{ answer: string }> {
  const reply = await llm.invoke(state.question);
  return { answer: reply.text };
}

console.log(await app.invoke({ question: "LangGraph ใช้ทำอะไร" }));
```

```text
{
  question: 'LangGraph ใช้ทำอะไร',
  answer: 'LangGraph ใช้ต่อขั้นตอนที่อ่านและอัปเดต State ร่วมกัน'
}
✅ node ส่งคำถามจาก State ให้โมเดลหนึ่งครั้ง
✅ คำตอบจากโมเดลอยู่ใน State
✅ State ยังเก็บคำถามเดิม
✅ เมื่อเปลี่ยนคำถาม node ส่งคำถามใหม่และเก็บคำตอบรอบใหม่
```

Node อัปเดต `answer` เพียงช่องเดียว เราจึงยังอ่านคำถามเดิมจากผลลัพธ์ได้

## 2. ข้อมูลเข้ากับค่าที่ได้จากโมเดล

| ค่า | ชนิดและความหมาย |
|---|---|
| `question` | `string` ที่ต้องส่งเมื่อเรียก Graph |
| `answer` | `string` ค่าเริ่มต้น `""` จนกว่า node จะเขียนคำตอบ |
| `await llm.invoke(state.question)` | ใช้คำถามเป็นข้อความเข้า แล้วรอผลชนิด `AIMessage` |
| `reply.text` | ส่วนข้อความของคำตอบที่นำไปใส่ `answer` |

## 3. เปลี่ยนคำตอบของโมเดลจำลอง

คัดลอกโค้ดก่อนส่วนตรวจคำตอบจาก [เฉลย `askGraph.ts`](./solution/askGraph.ts) ไปที่ [`playground.ts`](./playground.ts) เก็บ import ไว้ชุดเดียว เปลี่ยนข้อความแรกในรายการของ `fakeToolLLM` แล้วรัน `pnpm play 1-13` โดยใช้คำถามเดิม โมเดลจำลองคืนข้อความตามลำดับที่กำหนดไว้

| ข้อความแรกในรายการ | `result.answer` |
|---|---|
| `"LangGraph ใช้ต่อขั้นตอนที่อ่านและอัปเดต State ร่วมกัน"` | `"LangGraph ใช้ต่อขั้นตอนที่อ่านและอัปเดต State ร่วมกัน"` |
| `"ใช้สร้างเวิร์กโฟลว์แบบกราฟ"` | `"ใช้สร้างเวิร์กโฟลว์แบบกราฟ"` |

### ลองกับโมเดลที่ตั้งไว้ใน `.env`

เมื่อทำ [บท 1-01](../01-env-schema/README.md) และ [บท 1-02](../02-llm-config/README.md) เสร็จแล้ว ใช้ API key ของโมเดลที่เลือกใน `.env` และเชื่อมต่ออินเทอร์เน็ต ใน playground ให้แทน import ของ `fakeToolLLM` และบรรทัด `const llm = ...` ด้วย import นี้

```ts
import { llm } from "@lessons/level-1-basics/02-llm-config/llm";
```

รัน `pnpm play 1-13` อีกครั้งแล้วดู `answer` เนื้อหาที่ได้ขึ้นกับโมเดลที่ตั้งไว้

[บทถัดไป 1-14](../14-sequence/README.md) จะส่งผลจาก node แรกให้ node ที่สองผ่าน State
