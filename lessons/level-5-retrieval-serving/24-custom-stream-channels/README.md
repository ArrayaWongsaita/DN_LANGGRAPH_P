# บทที่ 5-24 Custom stream channel (ส่งข้อมูลเฉพาะแอปไปให้ฝั่ง UI)

## แนวคิด

บท 5-07 และ 5-08 อ่าน event มาตรฐานของ `streamEvents` v3 (`lifecycle`, `tasks`, `values` ฯลฯ) แต่ UI มักต้องการข้อมูล **เฉพาะแอป** เช่น "node ไหนกำลังรัน/เสร็จ/พัง" หรือ "ปิดบังข้อมูลส่วนตัวไปกี่จุด" แทนที่จะให้ทุก client แกะ event ดิบเอง เราให้ **ฝั่ง server แปลงครั้งเดียว** ด้วย **stream transformer** แล้วเผยแพร่เป็น channel ชื่อของเรา

```ts
const channel = StreamChannel.remote<NodeStatus>("node-status");
const graph = builder.compile({
  transformers: [() => ({
    init: () => ({ nodeStatus: channel }),     // ลงทะเบียน channel (ชื่อ remote ถูกต่อเข้ากับสตรีมให้เอง)
    process(event) { /* ดู event ทุกตัว */ channel.push(status); return true; }, // true = ให้ event เดิมไหลต่อ
  })],
});
```
ผลที่สังเกตได้จากการรันจริง:
- option ชื่อ `transformers` ของ `compile` (ถ้าใส่ผิดชื่อ จะไม่มี error และ channel ไม่ทำงาน)
- ตัวที่ได้เป็น event เพิ่มในสตรีม ชื่อ method `custom:<ชื่อ channel>` เช่น `custom:node-status` ข้อมูลอยู่ที่ `params.data`
- transformer **สร้างใหม่ต่อการรันหนึ่งครั้ง** (เป็น factory `() => ...`) จึงเก็บสถานะต่อรอบไว้ใน closure ได้
- `StreamChannel.local()` (ไม่ต้องตั้งชื่อ) ใช้ในโปรเซสเท่านั้น ไม่ถูกส่งไปที่ client
- ต้องใช้ `@langchain/langgraph` ≥ 1.3.1

เรื่องที่ต้องระวังจากของจริง: event `tasks` บอกแค่ "เริ่ม" (มี `input`) และ "จบ" (มี `result`) เมื่อ node ล้ม **บางกรณีไม่มี event `tasks` ที่มี `error`** (เช่น node ที่สองเป็นต้นไป) มีแค่ `lifecycle` `failed` ของทั้ง graph (พร้อมข้อความ error) ดังนั้น transformer ต้องจำว่า node ไหนกำลังรันอยู่ แล้วทำเครื่องหมาย error ให้ node เหล่านั้นเมื่อเห็น `failed`

ฝั่ง client (บท 5-25) ในเฟรมเวิร์กต่าง ๆ มี `useExtension(stream, "node-status")` สำหรับค่าล่าสุด และ `useChannel(stream, ["custom:node-status"])` สำหรับประวัติ (แพ็กเกจ UI เหล่านั้นเป็นของ React/Vue/Svelte/Angular คอร์สนี้ไม่รัน แต่หลักการเดียวกัน)

## 1. ลองเติมช่องเดียว

เปิด [`channels.ts`](./channels.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (Custom stream channel (ส่งข้อมูลเฉพาะแอปไปให้ฝั่ง UI)) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 5-24
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มีส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
try {
  const run = await (graph as unknown as { streamEvents: (i: object, o: object) => Promise<AsyncIterable<ProtocolEvent>> }).streamEvents(input, { version: "v3" });
  for await (const event of run) if (event.method === "custom:node-status") statuses.push(event.params.data as NodeStatus);
} catch {
  failed = true;
}
return { statuses, failed };
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
รันสำเร็จ (failed=false)
 event custom:node-status: plan:running plan:complete work:running work:complete report:running report:complete
 สถานะล่าสุด: [{"node":"plan","status":"complete"},{"node":"work","status":"complete"},{"node":"report","status":"complete"}]

รันnode work ล้ม (failed=true)
 event custom:node-status: plan:running plan:complete work:running work:error
 สถานะล่าสุด: [{"node":"plan","status":"complete"},{"node":"work","status":"error","error":"boom"}]
✅ nodeStatusFromEvent: เริ่ม/จบ/ล้มของ node
✅ nodeStatusFromEvent: result ที่เป็นค่าว่าง/falsy ยังนับว่าจบ และ error ที่เป็นสตริงว่างยังนับว่า error
✅ nodeStatusFromEvent: ข้ามสิ่งที่ไม่เกี่ยว (ชนิดอื่น, subgraph, ไม่มีชื่อ, ไม่มี input/result)
✅ graph จริงที่สำเร็จ: ได้ running→complete ของทุก node ตามลำดับ
✅ graph จริงที่ node work ล้ม: ทำเครื่องหมาย error พร้อมข้อความ และไม่โยน error ออกมา
✅ แต่ละการรันแยกสถานะกัน: รันที่ล้มแล้วรันที่ดีต่อไม่ติด error เก่า
✅ graph เดียวกันรันซ้ำได้ผลเท่าเดิม
✅ lifecycle failed ของ subgraph (namespace ไม่ว่าง) ไม่ทำเครื่องหมาย node ของ graph หลัก
✅ running ถูกล้างหลัง failed (failed รอบหลังไม่ทำเครื่องหมาย node เก่าซ้ำ)
✅ transformer สองตัวที่รันสลับกันมี channel และ running เป็นของตัวเอง
✅ process ปล่อยทุก event ไหลต่อ (คืน true) และ stream จริงยังมี event มาตรฐานครบ
✅ latestByNode: สถานะล่าสุดต่อ node เรียงตามที่เห็นครั้งแรก
```

สิ่งที่ได้: สร้าง channel ของตัวเองบนสตรีมของ graph พร้อมจัดการกรณี node ล้ม

## ข้อควรจำ

- ตัวแปลงต้องไม่ throw (ถ้าล้ม สตรีมทั้งเส้นล้มไปด้วย) event ที่ไม่รู้จักให้ปล่อยผ่าน
- อย่าใส่ข้อมูลลับใน channel (client เห็นทั้งหมด) ข้อความ error ควรผ่านการกรองก่อนส่งออกนอกระบบ (บท 5-16)
- ชื่อ channel เป็นสัญญากับ client เปลี่ยนแล้ว UI พัง

## ลองต่อใน playground

รัน `pnpm play 5-24` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `channels.ts`](./solution/channels.ts) · ไปต่อ [บท 5-25 จัดการสถานะ UI จากสตรีม (ส่วนที่ไม่ผูกกับเฟรมเวิร์ก)](../25-frontend-stream-state/README.md)
