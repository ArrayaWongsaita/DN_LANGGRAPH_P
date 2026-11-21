# บทที่ 2-01 เก็บข้อความใน State ด้วย `MessagesValue`

เมื่อ node ตอบข้อความผู้ใช้ เราต้องเก็บทั้งคำถามและคำตอบไว้ให้ node ถัดไปอ่านได้ บทนี้ลองสร้าง graph ที่มี node เดียวและใช้คำตอบตัวอย่าง เพื่อดูว่าข้อความเข้าและออกจาก State อย่างไร

## 1. ลองเพิ่มคำตอบเข้า State

ไฟล์ [`chat.ts`](./chat.ts) สร้าง graph ที่ตอบด้วย `AIMessage("รับทราบ")` เติมข้อ 1 ให้ node คืนคำตอบใหม่ แล้วรันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างนี้รันได้โดยไม่ใช้ API key

```sh
pnpm lesson 2-01
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", () => {
    const reply = new AIMessage("รับทราบ");
    return { messages: [reply] };
  })
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile();

const first = await graph.invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] });
```

ตอนเริ่มรอบแรก State มี `HumanMessage` หนึ่งข้อความ เมื่อ node คืน `{ messages: [reply] }` ตัวรวมข้อความของ `MessagesValue` จะเพิ่มคำตอบต่อท้าย ไฟล์พิมพ์ชนิดและข้อความของสองรอบให้ดู

```text
รอบแรก [
  { type: 'human', text: 'ฉันชื่อมาลี' },
  { type: 'ai', text: 'รับทราบ' }
]
รอบสอง [
  { type: 'human', text: 'ฉันชอบแมว' },
  { type: 'ai', text: 'รับทราบ' }
]
```

เรียก `invoke()` ครั้งใหม่บน graph นี้แล้วจะได้ State ของรอบนั้น ค่าใน `first.messages` ยังอ่านได้จากตัวแปร `first`

## 2. ค่าและข้อมูลที่ใช้บ่อย

| โค้ด | ใส่อะไร | ได้อะไร |
|---|---|---|
| `new HumanMessage("ฉันชื่อมาลี")` | ข้อความผู้ใช้เป็นสตริง หรือออบเจ็กต์ที่มี `content` และ `id` | ข้อความชนิด `"human"` |
| `new AIMessage("รับทราบ")` | ข้อความตอบกลับ | ข้อความชนิด `"ai"` |
| `new StateSchema({ messages: MessagesValue })` | กำหนดฟิลด์ `messages` ด้วยตัวรวมอาร์เรย์ข้อความ | State ที่รวมข้อความตาม `id` |
| `return { messages: [reply] }` | อาร์เรย์ของข้อความที่ node ต้องการเขียนเพิ่มหรือแก้ | State หลังรวมข้อความจาก node |
| `result.messages.at(-1)?.text` | อ่านข้อความสุดท้ายจากผลของ `invoke()` | สตริงของคำตอบ หรือ `undefined` เมื่ออาร์เรย์ว่าง |

## 3. เปลี่ยนข้อความที่ node คืน

| update ที่ node คืนในรอบแรก | จำนวน | ลำดับชนิดข้อความ |
|---|---:|---|
| `{ messages: [] }` | 1 | `["human"]` |
| `{ messages: [new AIMessage("รับทราบ")] }` | 2 | `["human", "ai"]` |
| `{ messages: [new AIMessage("รับทราบ"), new AIMessage("ยินดีช่วย")] }` | 3 | `["human", "ai", "ai"]` |

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/chat.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) แล้วเปลี่ยนค่าที่ node คืนและรัน `pnpm play 2-01`

## บทถัดไป

[บท 2-02 ใช้ checkpointer เก็บประวัติข้ามรอบ](../02-checkpointer/README.md)
