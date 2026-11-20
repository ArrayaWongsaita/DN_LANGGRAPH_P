# บทที่ 2-26 ตั้ง temperature และอ่านการใช้ token

งานหนึ่งอาจเรียกโมเดลหลายครั้ง เราดูจำนวน token ที่แต่ละครั้งรายงานผ่าน `usage_metadata` แล้วรวมเป็นยอดของงานได้ บทนี้ต่อจาก [บท 1-04 เรื่อง temperature](../../level-1-basics/04-temperature/README.md) และ [บท 1-05 เรื่องออบเจ็กต์คำตอบ](../../level-1-basics/05-message-object/README.md) โดยลองอ่านยอดก่อน แล้วค่อยเปลี่ยนการตั้งค่าของโมเดลจริง

## 1. รวม token จากคำตอบสามรายการ

เปิด [`usage.ts`](./usage.ts) แล้วเติมข้อ 1 ให้ `totalTokens` คืนค่าจาก `message.usage_metadata?.total_tokens` ถ้าไม่มีข้อมูลให้คืน `0` รันจากโฟลเดอร์หลักของโปรเจกต์ ตัวอย่างสร้าง `AIMessage` สามรายการไว้ล่วงหน้า จึงใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-26
```

```ts
import { AIMessage } from "@langchain/core/messages";

function totalTokens(message: AIMessage): number {
  return message.usage_metadata?.total_tokens ?? 0;
}

const replies = [
  new AIMessage({
    content: "โมจิ",
    usage_metadata: { input_tokens: 12, output_tokens: 5, total_tokens: 17 },
  }),
  new AIMessage("นิล"),
  new AIMessage({
    content: "ทองม้วน",
    usage_metadata: { input_tokens: 11, output_tokens: 4, total_tokens: 15 },
  }),
];

const perCall = replies.map(totalTokens);
const knownTotal = perCall.reduce((sum, count) => sum + count, 0);
console.log(JSON.stringify({ perCall, knownTotal }));
```

```text
{"perCall":[17,0,15],"knownTotal":32}
✅ อ่านยอดที่รายงานและใช้ 0 เมื่อไม่มีข้อมูล
```

ข้อความ `"นิล"` ไม่มี metadata ยอดที่ทราบจึงมาจาก `17 + 15` ถ้าทำรายงานการใช้งานจริง ให้เก็บด้วยว่าคำตอบใดไม่มีข้อมูล ดูโค้ดพร้อมส่วนตรวจได้ใน [`solution/usage.ts`](./solution/usage.ts)

## 2. ค่าที่ตั้งให้โมเดลและค่าที่อ่านจากคำตอบ

| ค่า | ชนิดและความหมาย |
|---|---|
| `temperature` | ตัวเลขที่ส่งให้ `getLLM({ temperature })` ตอนสร้างโมเดล เช่น `0` หรือ `0.8` ค่าต่ำมักทำให้คำตอบแปรผันน้อยลง ความเปลี่ยนแปลงที่เห็นและช่วงค่าที่รองรับขึ้นกับโมเดล |
| `usage_metadata` | ออบเจ็กต์ที่อาจไม่มี ถ้าเป็น `undefined` บทนี้แทนด้วย `0` เฉพาะตอนรวมยอดที่ทราบ |
| `input_tokens` | จำนวน token ของอินพุตที่รายงาน |
| `output_tokens` | จำนวน token ของเอาต์พุตที่รายงาน |
| `total_tokens` | ยอดรวมที่รายงานสำหรับการเรียกครั้งนั้น |

ถ้าต้องคำนวณค่าใช้จ่าย ให้เก็บยอดเข้าและยอดออกแยกกัน เพราะอัตราของแต่ละฝั่งอาจต่างกัน [เอกสาร LangChain เรื่องโมเดล](https://docs.langchain.com/oss/javascript/langchain/models) [เอกสาร LangChain เรื่องข้อความและ token usage](https://docs.langchain.com/oss/javascript/langchain/messages)

## 3. เปลี่ยนข้อมูลแล้วเทียบผล

คัดลอกโค้ดหัวข้อ 1 ไปไว้ใน [`playground.ts`](./playground.ts) โดยเก็บ import ไว้ชุดเดียว เปลี่ยนเฉพาะข้อความที่สองแล้วรัน `pnpm play 2-26`

| ข้อความที่สอง | ผลที่พิมพ์ |
|---|---|
| `new AIMessage("นิล")` | `{"perCall":[17,0,15],"knownTotal":32}` |
| `new AIMessage({ content: "นิล", usage_metadata: { input_tokens: 8, output_tokens: 3, total_tokens: 11 } })` | `{"perCall":[17,11,15],"knownTotal":43}` |
| เปลี่ยนเฉพาะ `content` เป็น `"นิลชอบนอนบนโซฟา"` โดยเก็บ metadata ของแถวก่อน | ยังคงได้ `{"perCall":[17,11,15],"knownTotal":43}` เพราะฟังก์ชันอ่านยอดที่รายงานจาก metadata |

เมื่อตั้งผู้ให้บริการและ API key ใน `.env` แล้ว ให้รันคำสั่งนี้เพื่อส่ง prompt เดียวกันไปยังโมเดลที่ตั้ง `temperature` เป็น `0` และ `0.8` อย่างละหนึ่งครั้ง

```sh
LESSON_LIVE=1 pnpm lesson 2-26
```

คำสั่งนี้เพิ่มผล JSON สองบรรทัด แต่ละบรรทัดมี `temperature`, `text` และ `usage` ตามด้วยบรรทัด `liveKnownTotal` ถ้าคำตอบไม่มี metadata ช่อง `usage` จะเป็น `null` ลองรันซ้ำด้วย prompt เดิมเพื่อเปรียบเทียบคำตอบของแต่ละค่า แล้วลองเพิ่มเงื่อนไขใน prompt เพื่อสังเกต `input_tokens` ค่า `temperature: 0` ก็อาจให้คำตอบต่างกันระหว่างรอบ

## บทถัดไป

[บท 2-27 ลองเรียกใหม่และสลับไปตัวสำรอง](../27-retry-fallback/README.md)
