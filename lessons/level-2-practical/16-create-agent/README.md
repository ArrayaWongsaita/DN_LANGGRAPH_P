# บทที่ 2-16 ประกอบ agent ด้วย `createAgent`

ใน [บท 2-11](../11-react-loop/README.md) เราเขียน graph ให้โมเดลขอใช้เครื่องมือ รับผล แล้วตอบผู้ใช้ `createAgent` ประกอบวงจรนี้ให้จากโมเดลและรายการเครื่องมือ บทนี้ใส่ checkpointer เพิ่มเพื่อใช้บทสนทนารอบก่อนใน thread เดิม

## 1. คุยสองรอบกับ agent ที่มีเครื่องมือเดียว

เติมข้อ 1 ใน [`create.ts`](./create.ts) ให้ agent รับ `model`, `[weather]`, `systemPrompt` และ `MemorySaver` รันจากโฟลเดอร์หลัก แล้วดูผลตรวจว่า agent ส่งคำสั่งระบบ เก็บประวัติ และเรียกเครื่องมือได้

```sh
pnpm lesson 2-16
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

[`create.ts`](./create.ts) เตรียม `model` ที่ตอบตามสคริปต์ และ `weather` ที่คืนข้อมูลตัวอย่างของเชียงใหม่ โค้ดส่วนประกอบ agent หลังเติมข้อ 1 มีดังนี้

```ts
const agent = createAgent({
  model,
  tools: [weather],
  systemPrompt: "ตอบสั้น ๆ",
  checkpointer: new MemorySaver(),
});

const config = { configurable: { thread_id: "mali" } };
const first = await agent.invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] }, config);
const second = await agent.invoke({ messages: [new HumanMessage("ขออากาศเชียงใหม่")] }, config);
```

สคริปต์พิมพ์ลำดับชนิดข้อความของรอบแรกและรอบที่สอง แล้วพิมพ์เนื้อหาจากข้อความชนิด `tool` ใช้ได้โดยไม่ต้องตั้ง API key

```text
["human","ai"]
["human","ai","human","ai","tool","ai"]
["อากาศเย็น 22 องศา"]
```

รอบแรกจบที่คำตอบของโมเดล รอบที่สองเริ่มจากข้อความเดิมสองรายการ แล้วเพิ่มคำถามใหม่ ตามด้วย `ai` ที่ขอเรียกเครื่องมือ, `tool` ที่เก็บผล และ `ai` ที่ตอบหลังเห็นผล `systemPrompt` ถูกส่งให้โมเดลตอนเรียกแต่ละครั้ง จึงเห็นในอินพุตของโมเดล ส่วน `result.messages` แสดงข้อความใน State

## 2. ตัวเลือกตอนสร้างและเรียก agent

| ค่า | ชนิดและตัวอย่าง | ผล |
|---|---|---|
| `model` | ออบเจ็กต์ chat model เช่น `model` ตามสคริปต์ในไฟล์ หรือ `llm` จาก [บท 1-02](../../level-1-basics/02-llm-config/README.md) | คืนข้อความหรือคำขอใช้เครื่องมือ โมเดลต้องรองรับ tool calling เมื่อส่ง `tools` |
| `tools` | อาร์เรย์ของเครื่องมือ เช่น `[weather]` | ระบุเครื่องมือที่โมเดลขอเรียกได้ |
| `systemPrompt` | `string` หรือ `SystemMessage` | เพิ่มคำสั่งระบบให้โมเดล |
| `checkpointer` | เช่น `new MemorySaver()` | เก็บ State ระหว่างการเรียก agent |
| `configurable.thread_id` | `string` เช่น `"mali"` | เลือก thread ที่จะอ่านและบันทึก State |

## 3. เปลี่ยน thread ของรอบที่สอง

คัดลอกส่วนหลัง import จากเฉลยลง [`playground.ts`](./playground.ts) แล้วตัดส่วนตรวจออก รัน `pnpm play 2-16` รอบแรกใช้ `"mali"` เหมือนเดิม รอบที่สองลองใช้ `{ configurable: { thread_id: "other" } }`

| `thread_id` ของรอบสอง | ลำดับ `second.messages` | ผล tool |
|---|---|---|
| `"mali"` | `["human","ai","human","ai","tool","ai"]` | `["อากาศเย็น 22 องศา"]` |
| `"other"` | `["human","ai","tool","ai"]` | `["อากาศเย็น 22 องศา"]` |

thread ใหม่เริ่มจากคำถามเรื่องอากาศทันที จึงมีข้อความน้อยลงสองรายการ

[ดูเฉลย](./solution/create.ts) · [บทก่อนหน้า 2-15 เลือกโมเดลและเครื่องมือตามคำถาม](../15-dynamic-model/README.md) · [บทถัดไป 2-17 ผู้ช่วยจดโน้ต](../17-mini-project/README.md)
