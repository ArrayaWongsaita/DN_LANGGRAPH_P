# บทที่ 1-09 ดึงชื่อและอายุด้วย `withStructuredOutput()`

ถ้าจะบันทึกชื่อกับอายุจาก “คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่” โปรแกรมต้องการชื่อเป็นข้อความและอายุเป็นตัวเลข จากวิธีอ่าน `.text` ใน [บท 1-03](../03-first-llm-call/README.md) คราวนี้ใช้ Zod แบบเดียวกับ [บท 1-01](../01-env-schema/README.md) เพื่อระบุชนิดข้อมูลที่ต้องการจากโมเดล

## 1. ให้โมเดลดึงสองฟิลด์ตาม schema

เปิด [`structuredOutput.ts`](./structuredOutput.ts) แล้วเติมข้อ 1 ให้ `llm.withStructuredOutput` รับ `personSchema` และกำหนด `method` เป็น `"functionCalling"` รันจากโฟลเดอร์หลักของโปรเจกต์หลังทำ [บท 1-02](../02-llm-config/README.md) เสร็จ ต้องมี API key อินเทอร์เน็ต และโมเดลที่รองรับ function calling

```sh
pnpm lesson 1-09
```

`llm` มาจากบท 1-02 เมื่อเรียก `.invoke` ผ่าน `structured` ผลที่ได้คือข้อมูลที่อ่านได้จาก `person.name` และ `person.age`

```ts
const personSchema = z.object({ name: z.string(), age: z.number() });
const structured = llm.withStructuredOutput(personSchema, { method: "functionCalling" });
const text = "คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่";
const person = await structured.invoke(`ดึงชื่อและอายุจากข้อความนี้ ${text}`);
```

ตัวอย่างผลที่อาจได้ รูปคำของชื่ออาจต่างกัน เช่น บางรอบมีคำว่า `คุณ` นำหน้า

```text
{ name: 'สมชาย', age: 42 }
✅ ได้ชื่อสมชายและอายุเป็นตัวเลข 42
```

## 2. ค่าและตัวเลือกที่ใช้

| ส่วน | ค่าที่ใช้ในบทนี้ |
|---|---|
| `schema` | `z.object(...)` ระบุฟิลด์ที่ต้องการ `name` รับ `string` และ `age` รับ `number` ทั้งสองฟิลด์ต้องมีค่าและไม่มีค่าเริ่มต้น |
| `method` | `"functionCalling"` ขอให้โมเดลคืนข้อมูลเป็นอาร์กิวเมนต์ของการเรียกฟังก์ชัน ความสามารถนี้ขึ้นกับโมเดลที่เลือก |
| `includeRaw` | ละได้ ค่า `false` เป็นค่าเริ่มต้นและคืนออบเจ็กต์ที่แปลงแล้ว ใช้ `true` เมื่อต้องการข้อความตอบดิบคู่กับผลที่แปลง |

Schema ตรวจโครงสร้างและชนิดข้อมูล ความถูกต้องของชื่อกับอายุยังต้องเทียบกับประโยคต้นฉบับ ตัวตรวจในไฟล์จึงดูทั้ง `สมชาย` และตัวเลข `42`

## 3. เปลี่ยนตัวเลขในประโยคเดิม

ก่อนทดลอง ให้นำโค้ดจากเฉลยตั้งแต่หลัง import ถึงก่อนส่วนตรวจคำตอบไปใส่ใน `playground.ts`

ใน [playground](./playground.ts) เก็บ schema และ prompt เดิมไว้ เปลี่ยนเฉพาะอายุในประโยคจาก `42` เป็น `27` เทียบ `person.age` ที่ควรเปลี่ยนจาก `42` เป็น `27` และ `typeof person.age` ที่ควรเป็น `"number"` ทั้งสองรอบ

ดู [เฉลย `structuredOutput.ts`](./solution/structuredOutput.ts) และรัน playground ด้วย `pnpm play 1-09` แล้วไป [บท 1-10 กำหนด State ของกราฟ](../10-state/README.md)
