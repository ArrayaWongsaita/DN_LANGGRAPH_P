# บทที่ 2-13 ส่ง error ของ tool กลับเป็น `ToolMessage`

เมื่อโมเดลขอให้ tool หารด้วยศูนย์ ฟังก์ชันสามารถโยน error ที่บอกสาเหตุได้ ค่าเริ่มต้นของ `ToolNode` จะแปลง error จาก tool เป็น `ToolMessage` เพื่อให้ agent อ่านได้ในรอบถัดไป

## 1. ส่งคำขอหารสำเร็จหนึ่งรายการและหารด้วยศูนย์หนึ่งรายการ

เปิด [`errors.ts`](./errors.ts) แล้วเติมข้อ 1 ให้ tool โยน `Error("หารด้วยศูนย์ไม่ได้")` เมื่อ `b` เป็น `0` รันจากโฟลเดอร์หลักของโปรเจกต์โดยไม่ต้องมี API key

```sh
pnpm lesson 2-13
```

โค้ดส่วนที่กำหนดว่าเมื่อไร tool ควรโยน error

```ts
const divide = tool(({ a, b }) => {
  if (b === 0) throw new Error("หารด้วยศูนย์ไม่ได้");
  return String(a / b);
}, {
  name: "divide",
  description: "หาร a ด้วย b",
  schema: z.object({ a: z.number(), b: z.number() }),
});
```

สคริปต์ส่ง `AIMessage` ที่ขอหาร `6 / 3` และ `1 / 0` ให้ `new ToolNode([divide])` แล้วพิมพ์ ID, สถานะ และเนื้อหาของผลทั้งสองรายการ [ดูเฉลย](./solution/errors.ts)

```text
{"tool_call_id":"ok","status":"success","content":"2"}
{"tool_call_id":"bad","status":"error","content":"Error: หารด้วยศูนย์ไม่ได้\n Please fix your mistakes."}
✅ หาร 6 ด้วย 3 ได้ 2
✅ หารด้วยศูนย์ได้ข้อความ error
```

ก่อนเติมข้อ 1 คำขอที่สองจะมีข้อความ `ยังไม่ได้ทำข้อ 1` อยู่ใน `ToolMessage` เพราะ `ToolNode` จัดการ error จาก `todo(1)` ด้วยวิธีเดียวกัน

## 2. ดูสถานะของ tool และปรับวิธีส่ง error

| ค่า | ค่าที่ใช้ในบท | ผล |
|---|---|---|
| `ToolNode` option `handleToolErrors` | `true` (ค่าเริ่มต้น) หรือ `false` | `true` แปลง error จาก tool เป็นข้อความ ส่วน `false` ส่ง exception ต่อให้ผู้เรียก |
| `message.status` | `"success"` หรือ `"error"` | อ่านเพื่อดูว่าการเรียกหนึ่งครั้งสำเร็จหรือผิดพลาด |
| `message.tool_call_id` | `"ok"` หรือ `"bad"` | จับคู่ผลกับคำขอเดิม |
| `message.content` | `"2"` หรือข้อความที่อธิบาย error | เป็นข้อมูลที่ agent จะอ่านเมื่อวนกลับเข้ารอบถัดไป |

ข้อความ error ควรบอกว่าอาร์กิวเมนต์ไหนผิด เช่น `"หารด้วยศูนย์ไม่ได้"` เพื่อให้ agent พิจารณาค่าที่จะลองใหม่ ถ้าต้องการจำกัดจำนวนครั้งที่ลองซ้ำ ให้ใช้ `recursionLimit` จาก [บท 2-12](../12-recursion-limit/README.md)

## 3. เปลี่ยนวิธีจัดการ error แล้วเทียบผล

คัดลอกเฉลยลง [`playground.ts`](./playground.ts) โดยใช้ import เพียงชุดเดียวและตัดส่วนตรวจออก เปลี่ยน options ที่สร้าง `ToolNode` แล้วรัน `pnpm play 2-13`

| วิธีสร้าง node | ผลเมื่อส่งสองคำขอเดิม |
|---|---|
| `new ToolNode([divide])` | คืน 2 ข้อความ สถานะ `["success", "error"]` |
| `new ToolNode([divide], { handleToolErrors: true })` | คืน 2 ข้อความ สถานะ `["success", "error"]` |
| `new ToolNode([divide], { handleToolErrors: false })` | `await node.invoke(...)` โยน `Error("หารด้วยศูนย์ไม่ได้")` ก่อนถึงลูปพิมพ์ผล |

## การบ้าน

ใช้ค่าเริ่มต้นของ `ToolNode` แล้วเปลี่ยน `b` ในคำขอที่มี ID `"bad"` จาก `0` เป็น `2` รัน `pnpm play 2-13` ให้เห็นสถานะ `"success"` และเนื้อหา `"0.5"` สำหรับคำขอเดิม

[บทก่อนหน้า 2-12 จำกัดจำนวน step](../12-recursion-limit/README.md) · [บทถัดไป 2-14 เก็บคำตอบแบบมีโครงสร้าง](../14-structured-final/README.md)
