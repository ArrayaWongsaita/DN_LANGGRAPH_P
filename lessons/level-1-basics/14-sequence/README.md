# บทที่ 1-14 ส่งผลจาก Node หนึ่งไปอีก Node ผ่าน State

เริ่มจากหัวข้อ `"การนอนหลับ"` ให้ขั้นแรกทำร่าง แล้วให้ขั้นที่สองอ่านร่างนั้นและติดป้ายว่าเป็นฉบับทบทวน เส้นตรงจาก [บท 1-12](../12-edges/README.md) กำหนดว่าขั้นไหนทำก่อน

## 1. อ่านร่างที่ Node ก่อนหน้าเขียนไว้

เปิด [`draftGraph.ts`](./draftGraph.ts) แล้วเติมข้อ 1 ให้ `improve` อ่าน `state.draft` เติม `" (ฉบับทบทวน)"` ต่อท้าย และคืนข้อความนั้นในช่อง `final` หลังติดตั้ง dependencies ด้วย `pnpm install` ให้รันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างใช้ข้อความที่สร้างในเครื่อง จึงใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 1-14
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`State` ในไฟล์ประกาศ `topic`, `draft` และ `final` โค้ดส่วนที่ส่งร่างผ่าน State มีดังนี้

```ts
function improve(state: typeof State.State): { final: string } {
  return { final: `${state.draft} (ฉบับทบทวน)` };
}

const app = new StateGraph(State)
  .addNode("writeDraft", (state) => ({ draft: `หัวข้อ ${state.topic}` }))
  .addNode("improve", improve)
  .addEdge(START, "writeDraft")
  .addEdge("writeDraft", "improve")
  .addEdge("improve", END)
  .compile();

const result = await app.invoke({ topic: "การนอนหลับ" });
console.log(result.draft);
console.log(result.final);
```

```text
หัวข้อ การนอนหลับ
หัวข้อ การนอนหลับ (ฉบับทบทวน)
✅ writeDraft สร้างร่างจาก topic
✅ improve เห็นร่างที่ writeDraft เพิ่งเขียน
✅ ฉบับทบทวนใช้ข้อความใน draft
```

เมื่อ `writeDraft` เขียนค่า `draft` แล้ว Graph ส่ง State ที่อัปเดตไปให้ `improve` จึงเห็นร่างและใช้สร้าง `final` ได้

## 2. ค่าที่ส่งผ่านแต่ละขั้น

| ช่อง | ชนิด | ใครเขียน |
|---|---|---|
| `topic` | `string` | ผู้เรียกต้องส่งใน `invoke()` |
| `draft` | `string` เริ่มที่ `""` | `writeDraft` |
| `final` | `string` เริ่มที่ `""` | `improve` |

## 3. ให้ `improve` ทำงานก่อน แล้วดูว่าอ่านค่าไหน

คัดลอกโค้ดก่อนส่วนตรวจคำตอบจาก [เฉลย `draftGraph.ts`](./solution/draftGraph.ts) ไปที่ [`playground.ts`](./playground.ts) เก็บ import ไว้ชุดเดียว แล้วกำหนดเส้นสามเส้นใหม่ตามตาราง รัน `pnpm play 1-14` ด้วย `{ topic: "การนอนหลับ" }`

| ลำดับ node | `result.draft` | `result.final` |
|---|---|---|
| `writeDraft` → `improve` | `"หัวข้อ การนอนหลับ"` | `"หัวข้อ การนอนหลับ (ฉบับทบทวน)"` |
| `improve` → `writeDraft` | `"หัวข้อ การนอนหลับ"` | `" (ฉบับทบทวน)"` |

เมื่อ `improve` ทำงานก่อน จะอ่าน `draft` ที่ยังเป็นสตริงว่าง แม้ว่า `writeDraft` จะมาเขียนร่างให้ในขั้นถัดไป

[บทถัดไป 1-15](../15-conditional-edge/README.md) จะให้ Graph เลือก node ถัดไปตามข้อมูลใน State
