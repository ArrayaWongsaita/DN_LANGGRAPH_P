# บทที่ 2-22 สตรีมข้อความจาก node ด้วย `messages`

แชตบอตที่มี node ร่างคำตอบและ node เกลาคำสามารถทยอยแสดงเฉพาะข้อความจากขั้นเกลาคำได้ บทนี้ต่อจาก [บท 1-19 ที่สตรีมการเปลี่ยนแปลงของ State](../../level-1-basics/19-stream/README.md) โดยอ่านชิ้นข้อความและชื่อ node ผ่าน `streamMode: "messages"`

## 1. รับชิ้นข้อความจาก `draft` และ `polish`

เปิด [`tokens.ts`](./tokens.ts) แล้วเติมข้อ 1 ให้ต่อ `chunk.text` เข้า `answer` เมื่อ `meta.langgraph_node` ตรงกับ `visibleNode` รันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างใช้โมเดลจำลองจึงรันได้โดยไม่ใช้ API key

```sh
pnpm lesson 2-22
```

```ts
import { AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { FakeStreamingChatModel } from "@langchain/core/utils/testing";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

const draftModel = new FakeStreamingChatModel({
  chunks: [new AIMessageChunk("ขอเสนอ "), new AIMessageChunk("ไปทะเล")],
});
const polishModel = new FakeStreamingChatModel({
  chunks: [new AIMessageChunk("ไปทะเล"), new AIMessageChunk("กันเถอะ!")],
});

const State = new StateSchema({ messages: MessagesValue });
const graph = new StateGraph(State)
  .addNode("draft", async (state) => ({ messages: [await draftModel.invoke(state.messages)] }))
  .addNode("polish", async (state) => ({ messages: [await polishModel.invoke(state.messages)] }))
  .addEdge(START, "draft")
  .addEdge("draft", "polish")
  .addEdge("polish", END)
  .compile();

const visibleNode = "polish";
let answer = "";
const stream = await graph.stream(
  { messages: [new HumanMessage("ชวนไปเที่ยวทะเล")] },
  { streamMode: "messages" },
);
for await (const [chunk, meta] of stream) {
  console.log(meta.langgraph_node, JSON.stringify(chunk.text));
  if (meta.langgraph_node === visibleNode) answer += chunk.text;
}
console.log("คำตอบที่แสดง", JSON.stringify(answer));
```

```text
draft "ขอเสนอ "
draft "ไปทะเล"
polish "ไปทะเล"
polish "กันเถอะ!"
คำตอบที่แสดง "ไปทะเลกันเถอะ!"
✅ ต่อเฉพาะชิ้นข้อความจาก polish
```

สี่บรรทัดแรกแสดงทุกชิ้นที่ graph ส่งมา ส่วน `answer` มีเฉพาะสองชิ้นจาก `polish` ถ้าต้องการทยอยแสดงในแอป ให้อัปเดตหน้าจอในเงื่อนไขเดียวกับที่ต่อ `answer` ดูโค้ดพร้อมส่วนตรวจได้ใน [`solution/tokens.ts`](./solution/tokens.ts)

## 2. แต่ละชิ้นมีข้อมูลอะไร

| ค่า | ชนิดและวิธีใช้ |
|---|---|
| `streamMode` | ใช้สตริง `"messages"` เพื่ออ่านแต่ละรายการเป็นคู่ `[chunk, meta]` |
| `chunk` | ออบเจ็กต์ข้อความ เช่น `AIMessageChunk` ในตัวอย่างนี้ อ่านส่วนที่เป็นข้อความด้วย `chunk.text` |
| `meta.langgraph_node` | ชื่อ node เช่น `"draft"` หรือ `"polish"` ใช้เลือกแหล่งข้อความที่ต้องการ |
| `meta.langgraph_step` | หมายเลข step ของ graph ในตัวอย่างนี้ `draft` อยู่ step 1 และ `polish` อยู่ step 2 |

ตัวอย่างกำหนดขอบเขตชิ้นไว้ล่วงหน้า โมเดลจริงอาจแบ่งชิ้นกลางคำหรือส่งชิ้นที่ `text` ว่างพร้อมข้อมูลอื่น การต่อข้อความจึงใช้ `+= chunk.text` โดยเก็บช่องว่างที่มากับชิ้นไว้ [เอกสาร LangGraph เรื่องสตรีมข้อความ](https://docs.langchain.com/oss/javascript/langgraph/streaming)

## 3. เปลี่ยน node ที่แสดงแล้วเทียบผล

คัดลอกโค้ดหัวข้อ 1 ไปไว้ใน [`playground.ts`](./playground.ts) โดยเก็บ import ไว้ชุดเดียว เปลี่ยน `visibleNode` แล้วรัน `pnpm play 2-22` ในแต่ละครั้ง

| `visibleNode` | `answer` ที่ได้ | ชิ้นที่นำมาต่อ |
|---|---|---|
| `"polish"` | `"ไปทะเลกันเถอะ!"` | `"ไปทะเล"` และ `"กันเถอะ!"` |
| `"draft"` | `"ขอเสนอ ไปทะเล"` | `"ขอเสนอ "` และ `"ไปทะเล"` |
| `"review"` | `""` | graph ชุดนี้ไม่มี node ชื่อ `review` |

## บทถัดไป

[บท 2-23 ส่งความคืบหน้าด้วย `custom`](../23-stream-custom/README.md)
