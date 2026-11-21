# บทที่ 3-30 retry, fallback และ middleware ที่เขียนเอง

## แนวคิด

บท 2-27 ทำ retry/fallback ที่ตัวโมเดล ใน `createAgent` มี middleware สำเร็จรูปให้ทำเรื่องเดียวกัน (และมีตัวเลือกเรื่องรอระหว่างลองให้ละเอียดกว่า):

```ts
modelRetryMiddleware({ maxRetries: 3, /* ลองใหม่ 3 ครั้ง = เรียกรวม 4 ครั้ง */ initialDelayMs: 1, onFailure: "error" }) // ลองใหม่เมื่อโมเดล error
modelFallbackMiddleware(backupModel)                          // ยังล้ม ให้ตัวสำรองตอบ
```
และเมื่อไม่มีตัวสำเร็จรูปที่ต้องการ **เขียนเองได้ง่าย** ด้วย `createMiddleware` โดยเลือกจุดแทรก `beforeModel` / `afterModel` ฯลฯ:

```ts
const logger = createMiddleware({
  name: "logger",
  beforeModel: async (state) => { console.log("ก่อนเรียกโมเดล", state.messages.length); return undefined; },
});
```
คืน `undefined` = ไม่แก้ State (คืน object = ผสานเข้า State)

## 1. ลองเติมช่องเดียว

เปิด [`resilient.ts`](./resilient.ts) แล้วเติมข้อ 1: เขียน middleware `logger` เองด้วย `createMiddleware` ที่จดจำนวนข้อความก่อนเรียกโมเดลแต่ละครั้ง รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เรียกโมเดลจริง ตั้ง provider และ API key ใน `.env` ตาม [บท 1-02](../../level-1-basics/02-llm-config/README.md) ก่อนรัน

```sh
pnpm lesson 3-30
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มีโมเดลจำลองที่ล่มก่อนแล้วค่อยตอบ, `modelRetryMiddleware` และ `modelFallbackMiddleware` ที่ตั้งไว้แล้ว ขาดแค่ middleware ที่เขียนเอง

โค้ดตามแนวทาง:

```ts
const logger = createMiddleware({
  name: "logger",
  beforeModel: async (state) => {
    seen.push(state.messages.length);
    return undefined;
  },
});
```

## 2. ผลที่ได้

ตัวอย่างผลที่รันจากเฉลย ข้อความจากโมเดลเปลี่ยนได้ทุกรอบ

```text
  retried: 'หลักตอบแล้ว',
  fellBack: 'สวัสดีครับ ขอให้คุณมีวันที่ดีและมีความสุขนะครับ',
  flakyAttempts: 3,
  seen: [ 1, 1 ]
✅ ล่มสองครั้งแล้วผ่าน: retry ช่วย ได้คำตอบของตัวหลัก (ลอง 3 ครั้ง)
✅ ตัวหลักล่มตลอด: สลับไปตัวสำรอง (llm จริง) ได้คำตอบ
✅ middleware ที่เขียนเองจดจำนวนข้อความก่อนเรียกโมเดล
```

สิ่งที่ได้: ใช้ middleware สำเร็จรูปและเขียนเองได้

## 3. ส่วนประกอบที่ใช้ในบทนี้

| middleware | ตัวเลือกสำคัญ | หมายเหตุ |
|---|---|---|
| `modelRetryMiddleware` | `maxRetries: 3`, `onFailure: "error"` | ค่าเริ่มต้นของ `onFailure` คือ `"continue"` ซึ่งจะไม่โยน error และ fallback จะไม่ทำงาน |
| `modelFallbackMiddleware` | `modelFallbackMiddleware(llm)` | ใช้ `llm` ตอบแทนเมื่อโมเดลหลักล่ม |
| `createMiddleware` | `{ name, beforeModel }` | `beforeModel` รันก่อนเรียกโมเดลทุกครั้ง |

## ข้อควรจำ

- ค่าเริ่มต้นของ `onFailure` ใน retry คือ `"continue"`: ลองหมดแล้วยังล้ม จะ **ไม่โยน error** แต่ส่งข้อความแจ้งความล้มเหลวเป็นคำตอบ ทำให้ fallback ไม่ทำงาน ถ้าอยากให้ fallback รับช่วงต้องตั้ง `onFailure: "error"`
- ลำดับ middleware มีผล: ตัวแรกในอาร์เรย์อยู่ชั้นนอกสุด ต้องการ "ลองใหม่ก่อน แล้วค่อยสลับตัวสำรอง" ให้ใส่ `fallback` ก่อน `retry` (`[logger, fallback, retry]`) เพราะ retry อยู่ชั้นในจึงลองซ้ำก่อนที่ fallback จะเห็น error
- middleware ที่เขียนเองควรเล็ก ทำหน้าที่เดียว

## ลองต่อใน playground

รัน `pnpm play 3-30` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `resilient.ts`](./solution/resilient.ts) · ไปต่อ [บท 3-31 Functional API (`entrypoint` และ `task`)](../31-functional-api/README.md)
