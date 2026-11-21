# บทที่ 4-04 ตรวจคำตอบของมนุษย์ด้วย zod (`responseSchema`)

## แนวคิด

`interrupt()` (บท 2-18) รับคำตอบอะไรก็ได้กลับมา ถ้าผู้ตอบส่งรูปแบบผิด (เช่นพิมพ์ "yes" แทน `true`) node จะได้ค่าผิดและพังทีหลัง ตั้งแต่ LangGraph 1.4.16 ใส่ **schema ของคำตอบ** เป็นอาร์กิวเมนต์ที่สองได้:

```ts
const Decision = z.object({ approved: z.boolean(), note: z.string().default("") });
const answer = interrupt({ question: "อนุมัติไหม?" }, { responseSchema: Decision });
// answer: { approved: boolean; note: string } (ผ่านการตรวจแล้ว และเติมค่า default ให้)
```
- คำตอบผ่านการตรวจ = `interrupt()` คืนค่าที่ parse แล้ว (รวมค่า default)
- คำตอบผิด = `invoke` ตอน resume โยน `ZodError` แต่ **thread ยังหยุดรออยู่** ส่งคำตอบใหม่ที่ถูกต้องซ้ำได้
- ถ้าให้ JSON Schema แทน zod จะถูกส่งออกไปให้ UI ใช้ แต่ **ไม่ถูกตรวจ**

## 1. ลองเติมช่องเดียว

เปิด [`approve.ts`](./approve.ts) แล้วเติมข้อ 1: ส่ง `{ responseSchema: Decision }` เป็นอาร์กิวเมนต์ที่สองของ `interrupt` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 4-04
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี schema `Decision` และฟังก์ชันที่ลองส่งคำตอบผิดรูปแบบก่อนส่งคำตอบที่ถูกให้แล้ว ขาดแค่การเรียก `interrupt` พร้อม schema

โค้ดตามแนวทาง:

```ts
const answer = interrupt({ question: "อนุมัติไหม?" }, { responseSchema: Decision });
return { result: JSON.stringify(answer) };
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
  rejected: '[
    "expected": "boolean",
    "code": "invalid_type",',
  retried: '{"approved":false,"note":"ไม่ครบ"}',
  filled: '{"approved":true,"note":""}'
✅ คำตอบผิดรูปแบบถูกปฏิเสธ ไม่ใช่ผ่านเงียบ ๆ
✅ ตอบผิดแล้วตอบใหม่ให้ถูก: thread ยังรออยู่และทำต่อได้
✅ คำตอบถูกรูปแบบ: ผ่าน และเติม default ให้ (note เป็นสตริงว่าง)
```

สิ่งที่ได้: กันคำตอบของมนุษย์ที่รูปแบบผิดตั้งแต่ปากทาง

## 3. ส่วนประกอบที่ใช้ในบทนี้

| คำตอบที่ส่ง | ผล |
|---|---|
| ตรงกับ schema เช่น `{ approved: true }` | `interrupt` คืนค่าที่ตรวจแล้วให้ node |
| ผิดรูปแบบ เช่น `"yes"` | ถูกปฏิเสธก่อนถึง node ด้วย error จาก zod |

## ข้อควรจำ

- ใช้ schema เดียวกันทั้งตอนแสดงฟอร์มและตอนตรวจ
- ส่งข้อความ error ที่เข้าใจง่ายกลับไปให้ผู้ตอบแก้

## ลองต่อใน playground

รัน `pnpm play 4-04` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `approve.ts`](./solution/approve.ts) · ไปต่อ [บท 4-05 หลาย interrupt พร้อมกัน](../05-parallel-interrupts/README.md)
