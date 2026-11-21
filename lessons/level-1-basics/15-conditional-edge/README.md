# บทที่ 1-15 เลือกทางด้วย `addConditionalEdges`

ส่งคำถามสั้นไปที่ `short` และคำถามยาวไปที่ `long` เส้นตรงจาก [บท 1-12](../12-edges/README.md) ใช้ต่อทางออกของทั้งสอง node ส่วนเส้นจากจุดเริ่มให้ router เลือกตามคำถาม

## 1. ให้ Router เลือกทางจากความยาวคำถาม

เปิด [`route.ts`](./route.ts) แล้วเติมข้อ 1 ให้ Graph ใช้ `routeByLength` เลือกจาก `START` ว่าจะไป `short` หรือ `long` หลังติดตั้ง dependencies ด้วย `pnpm install` ให้รันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างนี้รันในเครื่องได้โดยไม่ต้องมี API key

```sh
pnpm lesson 1-15
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`State` และ `graph` มาจากไฟล์ Graph มีทั้งสอง node และมีเส้นจากแต่ละ node ไป `END` แล้ว

```ts
function routeByLength(state: typeof State.State): "short" | "long" {
  return state.question.length <= 20 ? "short" : "long";
}

graph.addConditionalEdges(START, routeByLength, ["short", "long"]);

const app = graph.compile();
const short = await app.invoke({ question: "สวัสดี" });
const long = await app.invoke({ question: "ช่วยอธิบายเรื่อง LangGraph ให้หน่อย" });
console.log(`"${short.question}" (${short.question.length}) -> ${short.path}`);
console.log(`"${long.question}" (${long.question.length}) -> ${long.path}`);
```

```text
"สวัสดี" (6) -> short
"ช่วยอธิบายเรื่อง LangGraph ให้หน่อย" (35) -> long
✅ คำถามสั้นไปทาง short
✅ คำถามยาวไปทาง long
✅ ความยาว 20 ไปทาง short
✅ ความยาว 21 ไปทาง long
```

Router อ่าน `question` แล้วคืนชื่อปลายทาง Node ที่ถูกเลือกเขียนชื่อของตัวเองลง `path` ให้เราอ่านจากผลลัพธ์ได้

## 2. ต้นทาง Router และปลายทาง

| ค่าที่ส่งให้ `addConditionalEdges` | ความหมายในตัวอย่าง |
|---|---|
| `START` | ให้เลือกทางทันทีเมื่อ Graph เริ่มทำงาน ใช้ชื่อ node เป็นต้นทางได้ด้วย |
| `routeByLength` | ฟังก์ชันที่รับ State และคืน `"short"` หรือ `"long"` |
| `["short", "long"]` | รายชื่อปลายทางที่ router อาจคืน JavaScript API ละอาร์กิวเมนต์นี้ได้ ตัวอย่างระบุไว้ให้เห็นปลายทางครบ |

`question` เป็น `string` ที่ต้องส่ง ส่วน `path` เริ่มที่ `""` ความยาวใช้ `.length` ของ JavaScript ซึ่งนับหน่วย UTF-16 เช่น `"สวัสดี".length` ได้ `6`

## 3. เปลี่ยนเส้นแบ่งแล้วใช้คำถามเดิม

คัดลอกโค้ดก่อนส่วนตรวจคำตอบจาก [เฉลย `route.ts`](./solution/route.ts) ไปที่ [`playground.ts`](./playground.ts) เก็บ import ไว้ชุดเดียว แล้วรัน `pnpm play 1-15` ด้วยคำถามเดิม `"สวัสดี"` เปลี่ยนเฉพาะจำนวนที่นำไปเทียบกับ `state.question.length`

| เงื่อนไขใน router | เส้นทางสำหรับ `"สวัสดี"` |
|---|---|
| `length <= 20` | `short` |
| `length <= 5` | `long` |

[บทถัดไป 1-16](../16-loop/README.md) จะให้ router เลือกว่าจะวนกลับมาที่ node เดิมหรือจบ Graph
