# บทที่ 1-20 ประกอบผู้ช่วยที่เลือกวิธีตอบตามข้อความ

ผู้ช่วยที่ได้คำทักทายสามารถใช้คำตอบสำเร็จรูป ส่วนคำถามทั่วไปส่งให้โมเดลตอบ โปรเจกต์นี้รวมผลแบบมีโครงสร้างจาก [บท 1-09](../09-structured-output/README.md) กับการเลือกทางจาก [บท 1-15](../15-conditional-edge/README.md)

## 1. ลองรันผู้ช่วยกับข้อความสองแบบ

เปิด [`assistant.ts`](./assistant.ts) แล้วเติมข้อ 1 ให้ node `classify` คืนหมวดที่โมเดลจัด ข้อ 2 ให้เลือก node จาก `category` และข้อ 3 ให้ node `respond` คืนคำตอบ โมเดลจำลองทำให้รันรอบแรกได้โดยไม่ต้องตั้ง API key

```sh
pnpm lesson 1-20
```

```ts
function pickRoute({ category }: { category: string }): "smallTalk" | "respond" {
  return category === "greeting" ? "smallTalk" : "respond";
}
```

Graph ใช้ `withStructuredOutput()` ให้ node `classify` ได้ออบเจ็กต์ `{ category }` แล้วส่งต่อไปตามค่าที่ router คืน

```text
{"question":"สวัสดี","category":"greeting","answer":"สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ"}
{"question":"LangGraph ใช้ทำอะไร ตอบสั้น ๆ","category":"question","answer":"LangGraph ใช้สร้าง workflow ที่มี State"}
```

โมเดลจำลองให้คำตอบตามลำดับที่กำหนดไว้ การเขียน State และเลือกเส้นทางใช้ LangGraph จริง เมื่อตั้ง API key และโมเดลที่รองรับ structured output ตาม [บท 1-02](../02-llm-config/README.md) แล้ว เปิดการเรียกโมเดลจริงได้ด้วยคำสั่งนี้ ข้อความตอบอาจต่างจากตัวอย่าง

```sh
LESSON_LIVE=1 pnpm lesson 1-20
```

## 2. ค่าที่ส่งต่อใน graph

| ค่า | รูปแบบ | ใช้ที่ไหน |
|---|---|---|
| `question` | สตริง เช่น `"สวัสดี"` | อินพุตของ `invoke()` และข้อมูลให้โมเดลจัดประเภท |
| `category` | `"greeting"` หรือ `"question"` | schema ตรวจค่าที่ได้จากโมเดล แล้ว router ใช้เลือกทาง |
| `pickRoute()` | คืน `"smallTalk"` หรือ `"respond"` | `addConditionalEdges("classify", pickRoute, ["smallTalk", "respond"])` |
| `answer` | สตริง | ข้อความจาก node ปลายทางที่เก็บใน State สุดท้าย |

## 3. คงข้อความเดิมแล้วเปลี่ยนหมวดที่ได้

| เมื่อ classifier คืน | node ถัดไป | ผล |
|---|---|---|
| `{ category: "greeting" }` | `smallTalk` | คำทักทายที่กำหนดไว้ในโค้ด |
| `{ category: "question" }` | `respond` | ข้อความจากการเรียกโมเดลครั้งถัดไป |

ทดลองใน [`playground.ts`](./playground.ts) โดยคัดลอก [เฉลย](./solution/assistant.ts) ตั้งแต่ `const categorySchema` ถึงก่อนส่วนตรวจ ตั้งให้ลูปรันเฉพาะ `"สวัสดี"` แล้วเพิ่มบรรทัดนี้ก่อนประกาศ schema

```ts
const model: BaseChatModel = fakeToolLLM(['{"category":"question"}', "ข้อความจาก node respond"]);
```

รัน `pnpm play 1-20` แล้วสลับหมวดเป็น `"greeting"` คำทักทายจะเลือกคนละเส้นทางตามหมวดที่ได้

## บทถัดไป

[บท 2-01 เก็บข้อความใน State ด้วย MessagesValue](../../level-2-practical/01-messages-state/README.md)
