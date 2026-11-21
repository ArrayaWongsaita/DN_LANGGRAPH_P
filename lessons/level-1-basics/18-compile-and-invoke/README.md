# บทที่ 1-18 รัน graph ด้วย `compile()` และ `invoke()`

จาก [บท 1-16](../16-loop/README.md) เราควบคุมได้ว่า graph จะวนกลับหรือจบ ในบทนี้ใช้ graph ตัวเดียวรันหลายครั้ง และเปลี่ยนงบการทำงานของแต่ละรอบด้วย `recursionLimit`

## 1. ลอง compile ครั้งเดียวแล้วรันสามรอบ

เติมข้อ 1 ใน [`compileAndInvoke.ts`](./compileAndInvoke.ts) ให้ `builder.compile()` สร้าง graph ที่เรียก `invoke()` ได้ แล้วรันโดยไม่ต้องมี API key

```sh
pnpm lesson 1-18
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

แต่ละก้าว node `increment` เพิ่ม `n` ทีละ 1 แล้ววนต่อจนถึง `target` ตัวอย่างส่งทั้ง State ตั้งต้นและ config การรัน

```ts
const graph = builder.compile();
const result = await graph.invoke({ n: 1, target: 3 }, { recursionLimit: 5 });
console.log(result);
```

ไฟล์พิมพ์อินพุต งบ และผลของทั้งสามรอบ

```text
{"input":{"n":1,"target":3},"recursionLimit":5,"result":{"n":3,"target":3}}
{"input":{"n":1,"target":10},"recursionLimit":3,"error":"GraphRecursionError"}
{"input":{"n":1,"target":10},"recursionLimit":12,"result":{"n":10,"target":10}}
```

ในรอบสอง graph ใช้งบหมดก่อนถึงเป้า การเรียกครั้งถัดไปเริ่มตามอินพุตใหม่และใช้งบ 12 จึงถึง `target: 10`

## 2. ค่าที่ส่งให้ graph

| โค้ด | ค่า | ผล |
|---|---|---|
| `builder.compile()` | เรียกหลังประกอบ node และ edge | ได้ graph ที่รันซ้ำได้ |
| `graph.invoke(input, config)` | อาร์กิวเมนต์แรกเป็น State ตั้งต้น บทนี้ใช้ `{ n, target }` | คืน State ตอนจบผ่าน Promise |
| `config.recursionLimit` | จำนวนเต็มบวก เช่น `3`, `5`, `12` เวอร์ชันในคอร์สมีค่าเริ่มต้น `25` | จำกัดจำนวนก้าวการทำงานของรอบนั้น |
| `GraphRecursionError` | จับใน `catch` ด้วย `instanceof` | ระบุว่า graph จบไม่ได้ในงบที่ตั้งไว้ ไฟล์โยน error ชนิดอื่นต่อ |

## 3. เปลี่ยนงบโดยใช้เป้าเดิม

| อินพุต | `recursionLimit` | ผล |
|---|---:|---|
| `{ n: 1, target: 10 }` | 3 | `GraphRecursionError` |
| `{ n: 1, target: 10 }` | 12 | `{ n: 10, target: 10 }` |
| `{ n: 8, target: 10 }` | 5 | `{ n: 10, target: 10 }` |

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/compileAndInvoke.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) เปลี่ยนค่า `n` หรือ `recursionLimit` แล้วรัน `pnpm play 1-18`

## บทถัดไป

[บท 1-19 อ่านผลระหว่าง graph ทำงานด้วย stream](../19-stream/README.md)
