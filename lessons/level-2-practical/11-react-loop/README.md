# บทที่ 2-11 ต่อวง ReAct ด้วย `toolsCondition`

เมื่อ tool คำนวณได้ 42 แล้ว โมเดลต้องอ่านผลนั้นอีกครั้งเพื่อบอกผู้ใช้ วง ReAct ส่งคำขอจาก `agent` ไปที่ `tools` แล้วส่งผลกลับเข้า `agent` จนกว่าจะได้คำตอบที่ไม่มีคำขอเพิ่ม

```text
START → agent ── มี tool_calls ──► tools
           ▲                         │
           └───── ผลจาก tool ────────┘
          agent ── ไม่มี tool_calls ──► END
```

## 1. ให้กราฟบวก 12 กับ 30 แล้วตอบ

เปิด [`agent.ts`](./agent.ts) แล้วเติมข้อ 1 ให้ conditional edge ใช้ `toolsCondition` ตัวอย่างกำหนดคำตอบของโมเดลไว้ใน node `agent` เพื่อให้เห็นเส้นทางเดิมทุกรอบ ส่วน `ToolNode` รัน tool จริงในเครื่องตาม [บท 2-10](../10-tool-node/README.md) รันจากโฟลเดอร์หลักของโปรเจกต์โดยไม่ต้องมี API key

```sh
pnpm lesson 2-11
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

สามบรรทัดนี้เชื่อมเส้นทางตั้งแต่เริ่มจนกลับจาก tool

```ts
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])
  .addEdge("tools", "agent")
```

เมื่อ `agent` พบข้อความ `"12 + 30"` จะส่ง `AIMessage` ที่ขอใช้ `add` เมื่อกลับเข้ามาพร้อม `ToolMessage` จะนำผลมาตอบ จากนั้น `toolsCondition` เลือก `END` [ดูเฉลย](./solution/agent.ts)

```text
[human] 12 + 30
[ai] ขอเรียก add
[tool] 42
[ai] ผลบวกคือ 42
✅ ได้ผลบวกจาก tool ใน State
✅ agent อ่านผลแล้วตอบ
```

## 2. ฟังก์ชันเลือกทางอ่านค่าอะไร

| ค่า | ค่าที่ใช้ในกราฟ | ผล |
|---|---|---|
| อินพุตของ `toolsCondition` | `state` ที่มี `messages` หรืออาร์เรย์ข้อความโดยตรง | อ่านข้อความสุดท้าย `state.messages.at(-1)` |
| `tool_calls` มีสมาชิก | `[{ name: "add", args: { a: 12, b: 30 }, ... }]` | คืน `"tools"` ให้ node ชื่อนี้ทำงาน |
| `tool_calls` ว่างหรือไม่มีค่า | `[]` หรือ `undefined` | คืน `END` แล้วจบกราฟ |
| อาร์กิวเมนต์ตัวที่สามของ `.addConditionalEdges()` | `["tools", END]` | ประกาศปลายทางที่ฟังก์ชันเลือกได้ |

ทุก node คืนเฉพาะข้อความใหม่ เช่น `{ messages: [reply] }` เพราะ `MessagesValue` ช่วยรวมข้อความเข้ากับ State เดิม

## 3. เปลี่ยนข้อความแล้วเทียบเส้นทาง

คัดลอกโค้ดจากเฉลยลง [`playground.ts`](./playground.ts) โดยใช้ import เดิมชุดเดียวและตัดส่วนตรวจท้ายไฟล์ออก เปลี่ยนข้อความใน `new HumanMessage(...)` แล้วรัน `pnpm play 2-11`

| ข้อความผู้ใช้ | ลำดับ node | ข้อความใน State ตามลำดับ |
|---|---|---|
| `"12 + 30"` | `START → agent → tools → agent → END` | `[human] 12 + 30` → `[ai] ขอเรียก add` → `[tool] 42` → `[ai] ผลบวกคือ 42` |
| `"สวัสดี"` | `START → agent → END` | `[human] สวัสดี` → `[ai] สวัสดี` |

## การบ้าน

ใน playground เปลี่ยนเงื่อนไขของ node `agent` ให้ขอใช้ `add` เมื่อข้อความเป็น `"7 + 8"` และส่ง `{ a: 7, b: 8 }` รัน `pnpm play 2-11` ให้เห็น `[tool] 15` แล้วตามด้วย `[ai] ผลบวกคือ 15`

[บทก่อนหน้า 2-10 รันคำขอด้วย ToolNode](../10-tool-node/README.md) · [บทถัดไป 2-12 จำกัดจำนวน step](../12-recursion-limit/README.md)
