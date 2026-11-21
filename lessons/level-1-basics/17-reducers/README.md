# บทที่ 1-17 รวมค่าจากหลาย node ด้วย reducer

เมื่อ node สองตัวให้คะแนนในรอบเดียวกัน เราต้องการเก็บผลรวมของทั้งคู่ ใน State ให้ใช้ `ReducedValue` เพื่อกำหนดว่าค่าใหม่แต่ละรายการจะรวมกับค่าที่มีอยู่อย่างไร

## 1. ลองรวมคะแนน 1 กับ 2

เปิด [`reducers.ts`](./reducers.ts) เติมข้อ 1 ให้ตัวรวมคะแนนคืนผลบวกของ `current` และ `next` แล้วรันโดยไม่ต้องใช้ API key

```sh
pnpm lesson 1-17
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
const State = new StateSchema({
  score: new ReducedValue(z.number().default(0), {
    inputSchema: z.number(),
    reducer: (current, next) => current + next,
  }),
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current, next) => [...current, next],
  }),
});
```

ในไฟล์ node `a` คืน `{ score: 1, log: "a" }` และ node `b` คืน `{ score: 2, log: "b" }` ทั้งสองเริ่มจาก `START` และทำงานในก้าวเดียวกัน โค้ดทดลองรันหนึ่งครั้งจากค่าเริ่มต้น และอีกครั้งโดยส่งคะแนน 10 กับข้อความ `"start"` เข้า graph

```text
{"score":3,"log":["a","b"]}
{"score":13,"log":["start","a","b"]}
```

คะแนนถูกบวกสะสม ส่วน `log` เก็บข้อความทีละรายการในอาร์เรย์ ถ้าเอาลำดับงานไปใช้ตัดสินผล ให้เชื่อม edge ให้เห็นลำดับอย่างชัดเจน เพราะสอง node นี้ถูกตั้งให้ทำงานขนานกัน [เอกสาร LangGraph เรื่อง State และ reducer](https://docs.langchain.com/oss/javascript/langgraph/use-graph-api)

### ถ้าไม่มี reducer จะเกิดอะไรขึ้น

ช่องธรรมดาอย่าง `score: z.number().default(0)` รับค่าได้แค่หนึ่งค่าต่อหนึ่งก้าว ถ้า `a` กับ `b` เขียน `score` พร้อมกัน Graph จะโยน error แทนที่จะเดาว่าควรเก็บค่าไหน

```text
InvalidUpdateError: Invalid update for channel "score" with values [1,2]: LastValue can only receive one value per step.
```

reducer จึงเป็นกติกาที่บอก Graph ว่าค่าหลายค่าในก้าวเดียวกันต้องรวมกันอย่างไร

## 2. แต่ละพารามิเตอร์รับอะไร

| ตำแหน่ง | ค่าที่ใช้ | หน้าที่ |
|---|---|---|
| พารามิเตอร์แรกของ `ReducedValue` | `z.number().default(0)` หรือ `z.array(z.string()).default(() => [])` | ชนิดและค่าเริ่มต้นที่เก็บใน State |
| `inputSchema` | `z.number()` สำหรับคะแนน หรือ `z.string()` สำหรับ log หนึ่งรายการ | ชนิดข้อมูลอัปเดตที่ส่งเข้า reducer |
| `reducer(current, next)` | ฟังก์ชันที่รับค่าที่เก็บอยู่กับข้อมูลอัปเดตหนึ่งรายการ | คืนค่าใหม่ที่จะเก็บ ใช้ `[...current, next]` เมื่อต้องการต่อท้ายอาร์เรย์ |

## 3. เปลี่ยนอินพุตแล้วเทียบผล

| ค่าที่ส่งให้ `graph.invoke()` | `score` | `log` ที่พิมพ์ในตัวอย่าง |
|---|---:|---|
| `{}` | 3 | `["a", "b"]` |
| `{ score: 10 }` | 13 | `["a", "b"]` |
| `{ score: 10, log: "start" }` | 13 | `["start", "a", "b"]` |

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/reducers.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) แล้วแก้คะแนนตั้งต้นหรือค่าที่แต่ละ node คืน ทดลองด้วย `pnpm play 1-17`

## บทถัดไป

[บท 1-18 ใช้ compile, invoke และ recursionLimit](../18-compile-and-invoke/README.md)
