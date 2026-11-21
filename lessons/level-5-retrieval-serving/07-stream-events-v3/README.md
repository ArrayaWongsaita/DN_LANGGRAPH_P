# บทที่ 5-07 โมเดลเหตุการณ์ของ streamEvents v3

## แนวคิด

`stream()` (บท 1-18, 2-22) ให้คุณเลือกโหมดทีละแบบ (`values`, `updates`, `messages`) ส่วน `streamEvents(input, { version: "v3" })` ให้ **ท่อเดียวที่มีเหตุการณ์ทุกชนิด** เรียงตามเวลา แต่ละเหตุการณ์มีรูปร่างเดียวกัน (`ProtocolEvent`):

```ts
const run = await agent.streamEvents(input, { version: "v3" });
for await (const ev of run) {
  ev.seq;                 // ลำดับ (นับจาก 0)
  ev.method;              // ช่อง: "lifecycle" | "tasks" | "updates" | "values" | "messages" | "tools" | "checkpoints"
  ev.params.namespace;    // [] = กราฟหลัก, ["tools:<id>"] = งานย่อย
  ev.params.node;         // ชื่อ node (บางเหตุการณ์)
  ev.params.data;         // ข้อมูล รูปร่างขึ้นกับ method
}
await run.output;         // สถานะสุดท้าย (reject ถ้ากราฟล้ม)
```

ช่องที่ควรรู้ (รูปร่างจริงที่สังเกตจากการรัน):
- `lifecycle`: `{ event: "running" | "completed" | "failed", graph_name }` (ล้มจะมี `error`)
- `tasks`: ตอน node เริ่ม `{ id, name, input, ... }` และตอนจบ `{ id, name, result, error }` (แยกด้วยการมีคีย์ `input`)
- `tools`: `{ event: "tool-started", tool_call_id, tool_name, input }` แล้ว `{ event: "tool-finished", tool_call_id, output }` ที่ `output` คือ `ToolMessage` (ชื่อ tool ต้องจับคู่จาก `tool_call_id`)
- `messages`: `message-start`, `content-block-delta` (`delta.text` คือ token), `message-finish` (มี `usage`)

ข้อควรระวัง: ช่อง `values` และ `tasks` มี state ก้อนใหญ่ทั้งก้อน ถ้าส่งไปหน้าเว็บทั้งหมดจะหนักและอาจรั่วข้อมูล (บทถัดไปจะกรองให้)

## 1. ลองเติมช่องเดียว

เปิด [`events.ts`](./events.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (โมเดลเหตุการณ์ของ streamEvents v3) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 5-07
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

`src/streamDemo.ts` มีเอเจนต์ตัวอย่างที่เรียก tool หนึ่งครั้ง (โมเดลปลอม แต่เอเจนต์และ `streamEvents` ของจริง) สคริปต์ป้อนเหตุการณ์จริงจากมันให้ฟังก์ชันของคุณ
`events.ts` ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
return events.filter((ev) => ev.method === method);
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
ช่องที่เจอ: [
  'lifecycle',
  'checkpoints',
  'values',
  'tasks',
  'messages',
  'updates',
  'tools'
]
node ที่เริ่ม: [ 'model_request', 'tools', 'model_request' ]
tool ที่เสร็จ: [ { id: 'call_1_0', name: 'add', output: '3' } ]
✅ onChannel: กรองตามช่องและคงลำดับ
✅ startedNodes (เอเจนต์จริง): model_request → tools → model_request
✅ startedNodes: ไม่นับตอนจบงาน และไม่นับงานใน namespace ย่อย
✅ finishedTools (เอเจนต์จริง): ชื่อ tool และผลลัพธ์
✅ finishedTools: tool ที่เริ่มแต่ยังไม่จบไม่ถูกนับ และจับคู่ด้วย id แม้สลับลำดับ
✅ finishedTools: เนื้อหาที่ไม่ใช่ข้อความถูกแปลงเป็น JSON
```

สิ่งที่ได้: อ่านท่อเหตุการณ์เดียวแล้วดึงสิ่งที่ต้องการ: ช่อง, node ที่เริ่ม, tool ที่ทำเสร็จ

## ข้อควรจำ

- เหตุการณ์ที่มี `namespace` ไม่ว่างมาจากงานย่อยหรือ subgraph ไม่ใช่กราฟหลัก
- ถ้ากราฟล้ม การวนอ่านจะ throw (และ `run.output` reject) ต้อง `try/catch`

## ลองต่อใน playground

รัน `pnpm play 5-07` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `events.ts`](./solution/events.ts) · ไปต่อ [บท 5-08 แปลงเหตุการณ์เป็นความคืบหน้าสำหรับหน้าจอ](../08-progress-events/README.md)
