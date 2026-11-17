# บทที่ 3-30: retry, fallback และ middleware ที่เขียนเอง

## แนวคิด
บท 2-27 ทำ retry/fallback ที่ตัวโมเดล ใน `createAgent` มี middleware สำเร็จรูปให้ทำเรื่องเดียวกัน (และมีตัวเลือกเรื่องรอระหว่างลองให้ละเอียดกว่า):

```ts
modelRetryMiddleware({ maxRetries: 3, initialDelayMs: 1, onFailure: "error" }) // ลองใหม่เมื่อโมเดล error
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

## ดูตัวอย่าง
`resilient.ts` ขาด 3 ส่วน: retry, fallback และ middleware จดบันทึกที่เขียนเอง (จดว่ากี่ข้อความก่อนเรียกโมเดลแต่ละครั้ง)

## โจทย์
เติม 3 ข้อ แล้วรัน:

    pnpm test:lesson 3-30

## คุณทำได้แล้ว
- ใช้ middleware สำเร็จรูปและเขียนเองได้

## ข้อควรจำ
- ค่าเริ่มต้นของ `onFailure` ใน retry คือ `"continue"`: ลองหมดแล้วยังล้ม จะ **ไม่โยน error** แต่ส่งข้อความแจ้งความล้มเหลวเป็นคำตอบ ทำให้ fallback ไม่ทำงาน ถ้าอยากให้ fallback รับช่วงต้องตั้ง `onFailure: "error"`
- ลำดับ middleware มีผล: ตัวแรกในอาร์เรย์อยู่ชั้นนอกสุด ต้องการ "ลองใหม่ก่อน แล้วค่อยสลับตัวสำรอง" ให้ใส่ `fallback` ก่อน `retry` (`[logger, fallback, retry]`) เพราะ retry อยู่ชั้นในจึงลองซ้ำก่อนที่ fallback จะเห็น error
- middleware ที่เขียนเองควรเล็ก ทำหน้าที่เดียว

## บทถัดไป
Part 11: ส่วนเสริมและ capstone
