# บทที่ 2-23 ส่งความคืบหน้าระหว่างทำงานด้วย `custom`

สมมติว่า node `crawl` อ่านเอกสารทีละหน้า ผู้ใช้รอผลรวมจาก node และอยากเห็นด้วยว่าอ่านถึงหน้าไหนแล้ว บทนี้ให้ node ส่งความคืบหน้าเองด้วย `config.writer` แล้วให้โปรแกรมอ่านด้วย `streamMode: "custom"`

## 1. ส่งเหตุการณ์หลังอ่านแต่ละหน้า

เปิด [`progress.ts`](./progress.ts) แล้วเติมข้อ 1 ให้เรียก `config.writer` พร้อม `{ page, total: pages }` ในลูป รันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างจำลองเวลาอ่านหน้าละ 20 มิลลิวินาทีและใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-23
```

```ts
import { setTimeout } from "node:timers/promises";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  pages: z.number().default(0),
  done: z.string().default(""),
});
const graph = new StateGraph(State)
  .addNode("crawl", async ({ pages }, config) => {
    for (let page = 1; page <= pages; page++) {
      await setTimeout(20);
      config.writer?.({ page, total: pages });
    }
    return { done: `ครบ ${pages} หน้า` };
  })
  .addEdge(START, "crawl")
  .addEdge("crawl", END)
  .compile();

const stream = await graph.stream({ pages: 3 }, { streamMode: "custom" });
for await (const event of stream) {
  console.log(JSON.stringify(event));
}
```

```text
{"page":1,"total":3}
{"page":2,"total":3}
{"page":3,"total":3}
✅ ได้ความคืบหน้าของทั้ง 3 หน้าตามลำดับ
```

ทุกครั้งที่ node เรียก `writer` ลูปด้านนอกจะได้รับหนึ่งเหตุการณ์ ส่วน `return { done: ... }` อัปเดต State เมื่อ node จบ ดูโค้ดพร้อมส่วนตรวจได้ใน [`solution/progress.ts`](./solution/progress.ts)

## 2. ฝั่งส่งและฝั่งรับใช้ค่าอะไร

| ค่า | ชนิดและผลที่ได้ |
|---|---|
| `config.writer?.(event)` | ส่งค่า `event` ตามรูปแบบที่ออกแบบไว้ เช่น ออบเจ็กต์ `{ page: 1, total: 3 }` ใช้ `?.` เพราะ `writer` อาจเป็น `undefined` เมื่อรันแบบอื่น |
| `streamMode: "custom"` | แต่ละรายการคือค่าที่ส่งให้ `writer` โดยตรง |
| `streamMode: "updates"` | แต่ละรายการคือค่าที่ node คืนเพื่ออัปเดต State เช่น `{ crawl: { done: "ครบ 3 หน้า" } }` |

ถ้าจะส่งต่อไปยังหน้าเว็บ ให้ใช้ payload ที่แปลงเป็น JSON ได้ และตั้งชื่อฟิลด์ให้โปรแกรมฝั่งรับใช้งานได้ตรงกัน การเรียก `writer` เพียงอย่างเดียวส่งเหตุการณ์ผ่านสตรีม ส่วนฟิลด์ที่จะอยู่ใน State ต้องมาจากค่าที่ node คืน [เอกสาร LangGraph เรื่อง custom stream](https://docs.langchain.com/oss/javascript/langgraph/streaming)

## 3. เปลี่ยนจำนวนหน้าและโหมด

คัดลอกโค้ดหัวข้อ 1 ไปไว้ใน [`playground.ts`](./playground.ts) โดยเก็บ import ไว้ชุดเดียว แก้บรรทัด `graph.stream(...)` แล้วรัน `pnpm play 2-23`

| อินพุตและโหมด | ผลที่พิมพ์ |
|---|---|
| `{ pages: 2 }` และ `"custom"` | `{"page":1,"total":2}` ตามด้วย `{"page":2,"total":2}` |
| `{ pages: 0 }` และ `"custom"` | ไม่มีบรรทัด เพราะลูปใน node ทำงาน 0 รอบ |
| `{ pages: 2 }` และ `"updates"` | `{"crawl":{"done":"ครบ 2 หน้า"}}` หนึ่งบรรทัดเมื่อ node จบ |

## บทถัดไป

[บท 2-24 รับความคืบหน้าและผลจาก node ในสตรีมเดียว](../24-stream-multi/README.md)
