# บทที่ 5-12 Functional API ให้ลึกขึ้น

## แนวคิด

บท 3-31 สอน `entrypoint` + `task` พื้นฐาน บทนี้เพิ่ม 4 เครื่องมือที่ทำให้เวิร์กโฟลว์แบบฟังก์ชัน "ใช้งานจริงได้":

**1. ความจำข้ามรอบ (`getPreviousState` + `entrypoint.final`)**
ถ้ามี checkpointer, การ `invoke` thread เดิมอีกครั้งอ่านค่าที่บันทึกไว้รอบก่อนได้ และแยก "ค่าที่คืนให้ผู้เรียก" ออกจาก "ค่าที่เก็บไว้":

```ts
const wf = entrypoint({ name: "totals", checkpointer }, async (inc: number) => {
  const total = (getPreviousState<number>() ?? 0) + inc;
  return entrypoint.final({ value: total, save: total });   // value = คืนให้ผู้เรียก, save = เก็บไว้รอบหน้า
});
```
**2. `interrupt` ใน entrypoint:** หยุดรออนุมัติแล้ว `Command({ resume })` ต่อ จุดสำคัญ: ตอน resume ฟังก์ชัน **รันใหม่ตั้งแต่บรรทัดแรก** แต่ `task` ที่เสร็จแล้วจะ **ไม่รันซ้ำ** (ใช้ผลที่บันทึกไว้) จึงต้องใส่งานที่มีผลข้างเคียง (จองของ, ตัดเงิน, ส่งอีเมล) ไว้ใน `task` เสมอ ไม่ใช่ตรง ๆ ใน entrypoint
**3. สตรีมความคืบหน้า (`getWriter`)** ส่งข้อมูลออกทาง `streamMode: "custom"` ระหว่างทำงาน
**4. retry ต่อ task:** `task({ name, retry: { maxAttempts, initialInterval } }, fn)` ลองใหม่เฉพาะงานที่ล้ม (บท 3-06 ทำกับ node)

## 1. ลองเติมช่องเดียว

เปิด [`workflow.ts`](./workflow.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (Functional API ให้ลึกขึ้น) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 5-12
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`workflow.ts` มี task `reserve` / `ship` (นับจำนวนครั้งที่ถูกเรียกใน `calls`) ให้แล้ว ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
return entrypoint({ name: "totals", checkpointer }, async (inc: number) => {
  const total = (getPreviousState<number>() ?? 0) + inc;
  return entrypoint.final({ value: total, save: total });
});
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
Retrying task "flaky" after 956.54ms (attempt 1) after Error: Error: ล้มชั่วคราว
Retrying task "flaky" after 806.70ms (attempt 2) after Error: Error: ล้มชั่วคราว
  t1: 5,
  t2: 7,
  t3: 8,
  shipped: 'ส่งของ(จอง:หูฟัง)',
  cancelled: 'ยกเลิก',
  custom: [ { progress: 'เริ่ม' }, { progress: 'เสร็จ' } ],
  retried: 'สำเร็จ'
✅ totals: สะสมข้ามรอบใน thread เดิม และคืนเฉพาะ value (ไม่ใช่ { value, save })
✅ totals: thread ต่างกันไม่ปนกัน
✅ order: หยุดรออนุมัติหลังจอง (ยังไม่ส่งของ)
✅ order: อนุมัติแล้วส่งของ และ task จองไม่รันซ้ำตอน resume
✅ order: ไม่อนุมัติ → ยกเลิก ไม่ส่งของ
✅ progress: custom stream ได้เริ่ม/เสร็จตามลำดับ และผลลัพธ์ถูก
✅ retry: task ล้ม 2 ครั้งแล้วสำเร็จภายใน 3 ครั้ง
```

สิ่งที่ได้: เขียนเวิร์กโฟลว์แบบฟังก์ชันที่จำข้ามรอบ รออนุมัติ รายงานความคืบหน้า และลองใหม่เมื่อล้ม

## ข้อควรจำ

- โค้ดใน entrypoint ที่อยู่นอก `task` จะรันซ้ำตอน resume: ห้ามมีผลข้างเคียงหรือค่าสุ่ม/เวลาที่ผลต้องคงที่ (ใส่ใน task)
- ค่าที่ `task` คืนต้องแปลงเป็น JSON ได้
- Graph API ยังเป็นตัวเลือกแรกสำหรับ agent ที่ซับซ้อน (เห็นภาพและตรวจสอบได้ง่ายกว่า)

## ลองต่อใน playground

รัน `pnpm play 5-12` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `workflow.ts`](./solution/workflow.ts) · ไปต่อ [บท 5-13 เครื่องมือ SQL ที่ปลอดภัย](../13-safe-sql-tool/README.md)
