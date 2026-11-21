# บทที่ 2-12 จำกัดจำนวน step ด้วย `recursionLimit`

วง [ReAct จากบท 2-11](../11-react-loop/README.md) จะเดินจาก `agent` ไป `tools` แล้วกลับมาได้หลายรอบ ถ้า agent ขอ tool ต่อเนื่อง เราใช้ `recursionLimit` จำกัดจำนวน step ของกราฟต่อการรันหนึ่งครั้ง เมื่อใช้งบหมดก่อนถึงทางออก กราฟจะโยน `GraphRecursionError`

## 1. ให้งบพอสำหรับการใช้ tool สองรอบ

เปิด [`limit.ts`](./limit.ts) แล้วเติมข้อ 1 ให้ `recursionLimit` คำนวณจาก `maxToolRounds` ตัวอย่างใช้ node `agent` ที่ขอ tool ตามจำนวนรอบที่ตั้งไว้ จึงรันจากโฟลเดอร์หลักได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-12
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

โค้ดคำนวณงบและส่งค่าให้กราฟ

```ts
const maxToolRounds = 2;
const recursionLimit = 2 * maxToolRounds + 2;

const result = await graph.invoke({ messages: [], wantedRounds: 2 }, { recursionLimit });
console.log(result.messages.at(-1)?.text);
```

ในกราฟตัวอย่าง หนึ่งรอบใช้ 2 step สำหรับ `agent` ที่ขอ tool และ `tools` ที่รัน tool เผื่ออีก 2 step สำหรับจุดเริ่มต้นและ `agent` ที่ตอบครั้งสุดท้าย สคริปต์เต็มรันด้วยงบเดียวกันทั้งกรณีที่ขอ 2 รอบและ 100 รอบ [ดูเฉลย](./solution/limit.ts)

```text
recursionLimit = 6
ขอ tool 2 รอบ → เสร็จแล้ว
ขอ tool 100 รอบ → GraphRecursionError
✅ งบครบสำหรับ 2 รอบ
✅ ทำงานครบได้ 2 รอบ
✅ หยุดเมื่อจะทำ 100 รอบ
```

## 2. กำหนดงบที่ไหน

| ค่า | ชนิดหรือตัวอย่าง | ใช้ทำอะไร |
|---|---|---|
| `wantedRounds` | ตัวเลข เช่น `2` หรือ `100` | ค่า State ที่ใช้กำหนดว่า agent ตัวอย่างอยากขอ tool กี่รอบ |
| `maxToolRounds` | ตัวเลข เช่น `2` | ตัวแปรในบท ใช้คำนวณงบของกราฟตัวอย่าง |
| `recursionLimit` | จำนวนเต็มบวก เช่น `6` | ส่งผ่านออบเจ็กต์ตัวที่สองของ `graph.invoke(input, { recursionLimit })` |
| `GraphRecursionError` | คลาส error จาก `@langchain/langgraph` | ใช้ `instanceof` เพื่อจัดการเฉพาะกรณีหมดงบ ส่วน error อื่นส่งต่อด้วย `throw error` |

สูตร `2 * maxToolRounds + 2` ใช้กับเส้นทางนี้ ถ้ากราฟเพิ่ม node ต้องเผื่องบให้เส้นทางใหม่ หลาย tool call ใน `ToolNode` เดียวกันยังเป็นการเข้า node `tools` เพียงครั้งเดียว

## 3. เปลี่ยนงบแล้วเทียบผล

ย้ายโค้ดในเฉลยลง [`playground.ts`](./playground.ts) โดยใช้ import เพียงชุดเดียวและตัดส่วนตรวจออก จากนั้นแทนบรรทัดคำนวณด้วย `const recursionLimit = 5;` แล้วรัน `pnpm play 2-12` ลองทำซ้ำด้วยค่า 6 และ 7

| `recursionLimit` | เมื่อ `wantedRounds` เป็น `2` | เมื่อ `wantedRounds` เป็น `100` |
|---:|---|---|
| 5 | `GraphRecursionError` | `GraphRecursionError` |
| 6 | `เสร็จแล้ว` | `GraphRecursionError` |
| 7 | `เสร็จแล้ว` | `GraphRecursionError` |

## การบ้าน

กำหนดงบให้ขอ tool ได้ 3 รอบ จากนั้นเปลี่ยนรายการในลูปเป็น `[3, 4]` แล้วรัน `pnpm play 2-12` งบ `8` ควรทำให้กรณี 3 รอบตอบ `เสร็จแล้ว` และกรณี 4 รอบได้ `GraphRecursionError`

[บทก่อนหน้า 2-11 ต่อวง ReAct](../11-react-loop/README.md) · [บทถัดไป 2-13 จัดการ tool error](../13-tool-errors/README.md)
