# บทที่ 2-27 ลองเรียกใหม่และสลับไปตัวสำรอง

ถ้าเรียกโมเดลแล้วระบบปลายทางขัดข้องชั่วคราว เราอาจลองตัวเดิมอีกครั้ง ถ้ายังพลาดหลังครบจำนวนที่กำหนด ค่อยให้โมเดลสำรองตอบ บทนี้ประกอบสองขั้นนั้นด้วย `withRetry` และ `withFallbacks` ของ LangChain

## 1. ลองตัวหลักสองครั้ง แล้วเรียกตัวสำรอง

เปิด [`reliable.ts`](./reliable.ts) แล้วเติมข้อ 1 ให้ `reliable` เริ่มจาก `primary.withRetry(...)` จากนั้นจึงต่อ `.withFallbacks(...)` รันจากโฟลเดอร์หลักของโปรเจกต์ ตัวหลักและตัวสำรองเป็น Runnable จำลองที่คืน `AIMessage` จึงรันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-27
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
import { AIMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";

const failuresBeforeSuccess = 2;
const calls: string[] = [];
let attempts = 0;

const primary = RunnableLambda.from((_input: string) => {
  calls.push("primary");
  attempts++;
  if (attempts <= failuresBeforeSuccess) throw new Error("primary ยังไม่พร้อม");
  return new AIMessage("ตอบจากตัวหลัก");
});
const backup = RunnableLambda.from((_input: string) => {
  calls.push("backup");
  return new AIMessage("ตอบจากตัวสำรอง");
});

const reliable = primary
  .withRetry({ stopAfterAttempt: 2 })
  .withFallbacks({ fallbacks: [backup] });

const reply = await reliable.invoke("ทักทายหนึ่งประโยค");
console.log(JSON.stringify({ calls, answer: reply.text }));
```

```text
{"calls":["primary","primary","backup"],"answer":"ตอบจากตัวสำรอง"}
✅ ลองตัวหลัก 2 ครั้งแล้วเรียกตัวสำรอง
```

`primary` ล้มเหลวสองครั้งตามค่าที่จำลองไว้ เมื่อครบสองครั้ง LangChain ส่งข้อความเดิมให้ `backup` และคืนคำตอบของตัวสำรอง ดูโค้ดพร้อมส่วนตรวจได้ใน [`solution/reliable.ts`](./solution/reliable.ts)

## 2. พารามิเตอร์กำหนดลำดับอย่างไร

| ค่า | ชนิดและผลที่ได้ |
|---|---|
| `stopAfterAttempt` | จำนวนครั้งสูงสุดที่เรียก Runnable ที่ครอบอยู่ นับครั้งแรกด้วย ค่าเริ่มต้นคือ `3` และ `1` คือเรียกครั้งเดียว |
| `onFailedAttempt` | ฟังก์ชันเสริมสำหรับดู error และอินพุตของรอบที่พลาด เช่น ใช้บันทึก log |
| `fallbacks` | อาร์เรย์ Runnable สำรองที่รับอินพุตและคืนเอาต์พุตชนิดเดียวกับตัวหลัก ลองตามลำดับจนได้ผล ถ้าทุกตัวล้มเหลว `invoke` จะโยน error ของตัวหลักออกมา |

การครอบ `withRetry` ก่อน `withFallbacks` ทำให้ลองตัวหลักจนครบก่อนสลับตัวสำรอง รุ่นที่โปรเจกต์ใช้เว้นช่วงก่อนลองใหม่ เวลาแต่ละรอบจึงแปรผันได้

ถ้าใช้โมเดลจริง ให้รวมจำนวนครั้งที่ตัวเชื่อมต่อของโมเดลลองเองด้วยเมื่อกำหนดงบและเวลารอ

อ้างอิง: [`withRetry`](https://reference.langchain.com/javascript/langchain-core/runnables/Runnable/withRetry) และ [`RunnableWithFallbacks`](https://reference.langchain.com/javascript/langchain-core/runnables/RunnableWithFallbacks)

## 3. เปลี่ยนสาเหตุจำลองและจำนวนครั้ง

คัดลอกโค้ดหัวข้อ 1 ไปไว้ใน [`playground.ts`](./playground.ts) โดยเก็บ import ไว้ชุดเดียว เปลี่ยนค่าตามตารางแล้วรัน `pnpm play 2-27` ใหม่ทุกแถวเพื่อเริ่มตัวนับที่ศูนย์

| `failuresBeforeSuccess` | `stopAfterAttempt` | `calls` | `answer` |
|---:|---:|---|---|
| 0 | 2 | `["primary"]` | `"ตอบจากตัวหลัก"` |
| 1 | 2 | `["primary","primary"]` | `"ตอบจากตัวหลัก"` |
| 2 | 2 | `["primary","primary","backup"]` | `"ตอบจากตัวสำรอง"` |
| 2 | 1 | `["primary","backup"]` | `"ตอบจากตัวสำรอง"` |

ลองสลับเป็น `primary.withFallbacks({ fallbacks: [backup] }).withRetry({ stopAfterAttempt: 2 })` โดยตั้ง `failuresBeforeSuccess = 1` จะได้ `["primary","backup"]` เพราะครั้งแรกทั้งชุดได้คำตอบจาก `backup` แล้ว จึงไม่มีการลองทั้งชุดอีกรอบ

## บทถัดไป

[บท 3-01 กำหนด schema แยกสำหรับอินพุตและเอาต์พุตของ graph](../../level-3-advanced/01-input-output-schemas/README.md)
