# บทที่ 2-08 สร้าง tool ด้วย `tool()` และ Zod schema

ถ้าเรามีฟังก์ชันบวกเลขอยู่แล้ว เราใช้ `tool()` เพิ่มชื่อ คำอธิบาย และ schema ให้ฟังก์ชัน เพื่อให้โปรแกรมตรวจค่าก่อนรัน และให้โมเดลรู้ว่าจะขอใช้ฟังก์ชันนี้อย่างไรในบทถัดไป

## 1. ลองสร้าง tool บวกเลข

เปิด [`tools.ts`](./tools.ts) แล้วเติมข้อ 1 ให้ `a` และ `b` รับตัวเลขด้วย `z.number()` รันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างนี้ใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-08
```

โค้ดส่วนหลักหลังเติมข้อ 1

```ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const addSchema = z.object({ a: z.number(), b: z.number() });
const add = tool(({ a, b }) => String(a + b), {
  name: "add",
  description: "บวกเลขสองจำนวน",
  schema: addSchema,
});

const sum = await add.invoke({ a: 2, b: 3 });
console.log(sum, typeof sum);
```

`add.invoke()` ตรวจค่าด้วย schema ก่อนส่งให้ฟังก์ชัน ตัวฟังก์ชันใช้ `String(a + b)` จึงได้ผลเป็นสตริง สคริปต์เต็มลองส่ง JSON ที่มีค่าผิดชนิดด้วย [ดูเฉลย](./solution/tools.ts)

```text
5 string
ToolInputParsingException
✅ บวก 2 กับ 3 ได้สตริง 5
✅ schema ปฏิเสธ a เมื่อได้สตริง
```

## 2. ใส่อะไรให้ `tool()` ได้บ้าง

| ค่า | ตัวอย่าง | ใช้ทำอะไร |
|---|---|---|
| ฟังก์ชัน | `({ a, b }) => String(a + b)` | รับอาร์กิวเมนต์ที่ผ่าน schema แล้ว เขียนเป็นฟังก์ชัน `async` ได้เมื่อไปอ่านข้อมูลจากที่อื่น |
| `name` | `"add"`, `"getWeather"` | ชื่อที่ใช้เลือก tool ให้ตั้งชื่อแยกกันเมื่อส่งหลายตัวให้โมเดล |
| `description` | `"บวกเลขสองจำนวน"` | อธิบายว่า tool ทำอะไร เพื่อช่วยให้โมเดลเลือกใช้ |
| `schema` | `z.object({ a: z.number(), b: z.number() })` | กำหนดชนิดของอาร์กิวเมนต์ ตัวอย่าง tool อากาศใช้ `z.object({ city: z.string() })` |

ตัวอย่างเรียก tool ด้วยออบเจ็กต์อาร์กิวเมนต์โดยตรง จึงได้ผลจากฟังก์ชันตามที่เขียนไว้ Schema ใน `tool()` ใช้ตรวจ **อินพุต** ค่า `5` จึงมีชนิดเป็นสตริงตามที่ฟังก์ชันคืน

## 3. เปลี่ยนค่าอินพุตแล้วเทียบผล

คัดลอกโค้ดจากหัวข้อ 1 ลง [`playground.ts`](./playground.ts) แล้วแทนค่าที่ส่งให้ `add.invoke()` ทีละแถว รัน `pnpm play 2-08` จากโฟลเดอร์หลัก ถ้าคัดลอกทั้งบล็อกให้ใช้ import เพียงชุดเดียว

| ค่าใน `add.invoke(...)` | ผลที่ได้ |
|---|---|
| `{ a: 2, b: 3 }` | `5 string` |
| `{ a: -2, b: 3 }` | `1 string` |
| `JSON.parse('{"a":"2","b":3}')` | `ToolInputParsingException` เพราะ `a` เป็นสตริง |
| `JSON.parse('{"a":2}')` | `ToolInputParsingException` เพราะขาด `b` |

`JSON.parse()` ในสองแถวท้ายจำลองข้อมูลที่โปรแกรมรับจากภายนอก ดูวิธีจับ error ตามคลาสในเฉลยได้

## การบ้าน

เพิ่มฟังก์ชันคูณเลขใน playground ด้วยชื่อ `multiply` และใช้ schema เดียวกับ `add` รัน `pnpm play 2-08` ให้ `{ a: 2, b: 3 }` ได้ `6 string` และลองส่ง `b` เป็นสตริงเพื่อดูว่า schema ยังจับได้

[บทก่อนหน้า 2-07 เก็บ State ลง SQLite](../07-sqlite-saver/README.md) · [บทถัดไป 2-09 ผูก tools กับโมเดล](../09-bind-tools/README.md)
