# บทที่ 1-12 กำหนดลำดับด้วย Edge, `START` และ `END`

ให้ Graph ผ่าน `first` แล้วค่อยผ่าน `second` โดยแต่ละ node คืนอัปเดต `trace` ตามแบบ [บท 1-11](../11-node/README.md) เมื่อรันเสร็จ เราจะอ่านจาก `trace` ได้ว่า Graph ผ่านขั้นไหนก่อน

## 1. ต่อเส้นจาก `first` ไป `second`

เปิด [`pipeline.ts`](./pipeline.ts) แล้วเติมข้อ 1 ด้วย `addEdge` เพื่อเชื่อม node สองตัว รันจากโฟลเดอร์หลักของโปรเจกต์หลังติดตั้ง dependencies ด้วย `pnpm install` ใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 1-12
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`graph` ในไฟล์มี node `first` และ `second` พร้อมเส้น `START` ไป `first` และ `second` ไป `END` เติมเส้นตรงกลางแล้วค่อย compile และรัน

```ts
graph.addEdge("first", "second");
const result = await graph.compile().invoke({});
console.log(result.trace);
```

```text
first>second
✅ graph เดินผ่าน first แล้วจึงถึง second
```

`first` เขียนชื่อตัวเองลงใน `trace` จากนั้น `second` ต่อชื่อของตัวเองท้ายค่าที่อ่านมา เครื่องหมาย `>` คั่นชื่อที่ผ่านแต่ละขั้น

## 2. ต้นทางและปลายทางของ `addEdge`

| ค่า | ใช้อย่างไรในตัวอย่าง |
|---|---|
| `addEdge(from, to)` | ต้องส่งต้นทางและปลายทางทั้งคู่ ชื่อ node ต้องตรงกับชื่อที่ให้ไว้ใน `addNode` |
| `START` | ต้นทางพิเศษสำหรับต่อไปยัง node แรก |
| `END` | ปลายทางพิเศษสำหรับจบ Graph |
| `trace` | ข้อความที่มีค่าเริ่มต้น `""` จึงเริ่มด้วย `invoke({})` ได้ |

ตอน `compile()` LangGraph ตรวจว่าแต่ละ node มีเส้นทางเข้าถึงจากจุดเริ่มต้น ถ้าเจอ `not reachable` ให้ตรวจเส้นที่เดินไปยัง node นั้น

## 3. สลับเส้นแล้วดูว่าใครมาก่อน

คัดลอกโค้ดก่อนส่วนตรวจคำตอบจาก [เฉลย `pipeline.ts`](./solution/pipeline.ts) ไปที่ [`playground.ts`](./playground.ts) เก็บ import ไว้ชุดเดียว ในแต่ละแถวให้ต่อเส้นสามเส้นตามลำดับ แล้วรัน `pnpm play 1-12` ด้วย input `{}` เดิม

| เส้นที่ต่อด้วย `addEdge` | `result.trace` |
|---|---|
| `START` → `first` → `second` → `END` | `first>second` |
| `START` → `second` → `first` → `END` | `second>first` |

[บทถัดไป 1-13](../13-llm-node/README.md) จะให้ node รอคำตอบจากโมเดลแล้วเขียนผลลง State
