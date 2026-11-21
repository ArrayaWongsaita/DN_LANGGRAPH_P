# บทที่ 2-24 รับหลายโหมดจากสตรีมเดียว

จาก [บท 2-23](../23-stream-custom/README.md) เราอ่านความคืบหน้าจาก `custom` ได้แล้ว ถ้าหน้าจอเดียวกันต้องแสดงผลสรุปตอน node จบ ให้ขอ `updates` เพิ่มในการเรียก `graph.stream()` ครั้งเดียว

## 1. รับทั้งความคืบหน้าและผลจาก node `crawl`

เปิด [`multi.ts`](./multi.ts) แล้วเติมข้อ 1 ให้ `streamMode` เป็นอาร์เรย์ที่มี `"updates"` และ `"custom"` จากนั้นรันจากโฟลเดอร์หลักของโปรเจกต์ ใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-24
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  pages: z.number().default(0),
  done: z.string().default(""),
});
const graph = new StateGraph(State)
  .addNode("crawl", ({ pages }, config) => {
    for (let page = 1; page <= pages; page++) config.writer?.({ page });
    return { done: `ครบ ${pages} หน้า` };
  })
  .addEdge(START, "crawl")
  .addEdge("crawl", END)
  .compile();

const stream = await graph.stream({ pages: 2 }, { streamMode: ["updates", "custom"] });
for await (const [mode, data] of stream) {
  console.log(JSON.stringify([mode, data]));
}
```

```text
["custom",{"page":1}]
["custom",{"page":2}]
["updates",{"crawl":{"done":"ครบ 2 หน้า"}}]
✅ ได้ custom ตามด้วย updates ของ crawl
```

`custom` มาก่อนเพราะ node เรียก `writer` ระหว่างลูป ส่วน `updates` มาจากค่าที่ `crawl` คืนเมื่อจบ โปรแกรมฝั่งรับใช้ `if (mode === "custom")` เพื่อเลือกอัปเดตแถบความคืบหน้าได้ ดูโค้ดพร้อมส่วนตรวจใน [`solution/multi.ts`](./solution/multi.ts)

## 2. รูปแบบของ `streamMode` เปลี่ยนค่าที่อ่านได้

| ค่า `streamMode` | แต่ละรายการที่อ่านได้ |
|---|---|
| `"updates"` | ข้อมูลของโหมดนั้นโดยตรง เช่น `{ crawl: { done: "ครบ 2 หน้า" } }` |
| `["updates"]` | คู่ `["updates", data]` แม้มีโหมดเดียวในอาร์เรย์ |
| `["updates", "custom"]` | คู่ `[mode, data]` ที่ `mode` เป็น `"updates"` หรือ `"custom"` |

`updates` ส่งส่วนที่ node อัปเดตใน State โดยมีชื่อ node เป็นคีย์ `custom` ส่งข้อมูลจาก `writer` และ `values` ส่ง State ทั้งก้อน เลือกโหมดตามข้อมูลที่โปรแกรมฝั่งรับต้องใช้ ส่วน `"messages"` จาก [บท 2-22](../22-stream-messages/README.md) ให้ `data` เป็นคู่ `[chunk, meta]` [เอกสาร LangGraph เรื่อง stream modes](https://docs.langchain.com/oss/javascript/langgraph/streaming)

## 3. เปลี่ยนโหมดแล้วเทียบรูปร่างข้อมูล

คัดลอกโค้ดหัวข้อ 1 ไปไว้ใน [`playground.ts`](./playground.ts) โดยเก็บ import ไว้ชุดเดียว เปลี่ยนลูปเป็น `for await (const event of stream) { console.log(JSON.stringify(event)); }` เพื่อพิมพ์ข้อมูลดิบทั้งแบบสตริงและอาร์เรย์ แล้วรัน `pnpm play 2-24` ในแต่ละครั้ง

| `streamMode` | สิ่งที่ได้เมื่อ `pages: 2` |
|---|---|
| `["custom", "updates"]` | เหมือนหัวข้อ 1 เพราะสตรีมส่งตามจังหวะที่เหตุการณ์เกิด |
| `"updates"` | `{"crawl":{"done":"ครบ 2 หน้า"}}` |
| `["updates"]` | `["updates",{"crawl":{"done":"ครบ 2 หน้า"}}]` |
| `["custom", "values"]` | `["values",{"pages":2,"done":""}]` → `["custom",{"page":1}]` → `["custom",{"page":2}]` → `["values",{"pages":2,"done":"ครบ 2 หน้า"}]` |

## บทถัดไป

[บท 2-25 ให้โมเดลเห็นตัวอย่างคำตอบด้วย few-shot](../25-few-shot/README.md)
