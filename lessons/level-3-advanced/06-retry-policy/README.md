# บทที่ 3-06 retry policy ของ node

## แนวคิด

บท 2-27 ทำ retry ที่ระดับ LLM แต่ node ใน graph ทำอย่างอื่นด้วย (เรียก API, อ่านฐานข้อมูล) ที่พลาดชั่วคราวได้ LangGraph ให้ตั้ง **`retryPolicy` ต่อ node** ได้เลย:

```ts
.addNode("fetchData", fetchData, {
  retryPolicy: {
    maxAttempts: 3,                 // ลองรวมสูงสุด 3 ครั้ง
    retryOn: (e) => e instanceof NetworkError, // เลือกว่า error แบบไหนควรลองใหม่
  },
})
```
- ไม่ใส่ `retryOn` = ลองใหม่กับ error ทั่วไปส่วนใหญ่ (ใน JS รวมถึง `TypeError`; ที่ข้ามคือการยกเลิก, โควตาหมด และ error HTTP 400-407 กับ 409 ส่วน 408 และ 5xx จะลองใหม่) จึงควรกำหนด `retryOn` เองเมื่ออยากเลือกชนิด error
- error ที่ไม่ผ่าน `retryOn` จะโยนออกทันที ไม่เสียเวลาลอง
- ระหว่างลองจะรอเว้นช่วงเพิ่มขึ้นเรื่อย ๆ ตั้งค่าได้ (`initialInterval` ฯลฯ)

## 1. ลองเติมช่องเดียว

เปิด [`retry.ts`](./retry.ts) แล้วเติมข้อ 1: เขียน `retryOn` ให้ไม่ลองซ้ำเมื่อเป็น `PermanentError` รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-06
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี node `flaky` (ล้มเหลวสองครั้งแรกแล้วสำเร็จ) และ node `strict` (ล้มด้วย `PermanentError`) พร้อม `maxAttempts` ที่ตั้งไว้แล้ว ขาดแค่ฟังก์ชัน `retryOn` ที่ตัดสินว่า error ไหนควรลองซ้ำ

โค้ดตามแนวทาง:

```ts
retryOn: (e: unknown) => !(e instanceof PermanentError),
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
Retrying task "work" after 571.91ms (attempt 1) after Error: Error: ล้มเหลวชั่วคราว
Retrying task "work" after 118.72ms (attempt 2) after Error: Error: ล้มเหลวชั่วคราว
  outcomes: { flaky: 'สำเร็จ', strict: 'PermanentError' },
  counters: { flaky: 3, strict: 1 }
✅ flaky: ล้มสองครั้ง ครั้งที่สามสำเร็จ
✅ strict: error ถาวรไม่ถูกลองซ้ำ (เรียกครั้งเดียว)
```

สิ่งที่ได้: ทำให้ node ทนต่อความล้มเหลวชั่วคราวโดยแยกแยะ error ถาวร

## 3. ส่วนประกอบที่ใช้ในบทนี้

| ตัวเลือกใน `retryPolicy` | ชนิด | หน้าที่ |
|---|---|---|
| `maxAttempts` | ตัวเลข | จำนวนครั้งสูงสุดที่รัน node รวมครั้งแรก |
| `retryOn` | ฟังก์ชัน `(error) => boolean` | คืน `true` เมื่อ error นั้นควรลองซ้ำ |
| `initialInterval` | ตัวเลข (มิลลิวินาที) | เวลารอก่อนลองครั้งถัดไป |

## ข้อควรจำ

- retry ที่ node ลองรันทั้ง node ใหม่ ถ้า node มีผลข้างเคียงต้องปลอดภัยเมื่อรันซ้ำ
- บทนี้ช้าเล็กน้อยเพราะมีการรอระหว่างลอง

## ลองต่อใน playground

รัน `pnpm play 3-06` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `retry.ts`](./solution/retry.ts) · ไปต่อ [บท 3-07 cache policy (ไม่ทำซ้ำงานที่เคยทำแล้ว)](../07-cache-policy/README.md)
