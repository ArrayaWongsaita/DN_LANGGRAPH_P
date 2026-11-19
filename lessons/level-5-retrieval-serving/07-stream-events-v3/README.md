# บทที่ 5-07: โมเดลเหตุการณ์ของ streamEvents v3

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

## ดูตัวอย่าง
`src/streamDemo.ts` มีเอเจนต์ตัวอย่างที่เรียก tool หนึ่งครั้ง (โมเดลปลอม แต่เอเจนต์และ `streamEvents` ของจริง) สคริปต์ป้อนเหตุการณ์จริงจากมันให้ฟังก์ชันของคุณ
`events.ts` ขาด 3 ส่วน

## โจทย์
เติม 3 ข้อ แล้วรัน:

    pnpm lesson 5-07

สคริปต์จะพิมพ์ผล แล้วท้ายไฟล์มีส่วนตรวจที่แสดง ✅/❌ (ไม่ต้องแก้และไม่ต้องอ่านก็ได้)

## คุณทำได้แล้ว
- อ่านท่อเหตุการณ์เดียวแล้วดึงสิ่งที่ต้องการ: ช่อง, node ที่เริ่ม, tool ที่ทำเสร็จ

## ข้อควรจำ
- เหตุการณ์ที่มี `namespace` ไม่ว่างมาจากงานย่อยหรือ subgraph ไม่ใช่กราฟหลัก
- ถ้ากราฟล้ม การวนอ่านจะ throw (และ `run.output` reject) ต้อง `try/catch`

## บทถัดไป
บท 5-08: แปลงเหตุการณ์เป็นความคืบหน้าสำหรับหน้าจอ
