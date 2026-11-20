# บทที่ 2-03 ใช้ `thread_id` แยกบทสนทนา

[บท 2-02](../02-checkpointer/README.md) เก็บประวัติด้วยรหัสเดียว ลองนึกว่ามาลีและสมชายใช้ graph เดียวกัน แต่แต่ละคนต้องเห็นเฉพาะห้องของตัวเอง เราใช้ `thread_id` บอก checkpointer ว่าแต่ละรอบอยู่ในห้องใด

## 1. ลองสลับระหว่างสองห้อง

เติมข้อ 1 ใน [`threads.ts`](./threads.ts) ให้ `invoke()` รับ config ที่มีรหัสห้องของรอบนั้น แล้วรันโดยไม่ต้องใช้ API key

```sh
pnpm lesson 2-03
```

```ts
const turns = [
  { threadId: "mali:งาน", text: "ส่งรายงานแล้ว" },
  { threadId: "somchai:งาน", text: "เริ่มทำรายงาน" },
  { threadId: "mali:งาน", text: "ตรวจรายงานแล้ว" },
];

for (const { threadId, text } of turns) {
  const result = await graph.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: threadId } },
  );
  console.log(threadId, result.messages.length);
}
```

```text
mali:งาน 2
somchai:งาน 2
mali:งาน 4
```

สมชายเริ่มด้วยประวัติว่าง จึงได้ข้อความผู้ใช้และ AI รวม 2 ข้อความ เมื่อมาลีกลับห้องเดิม รอบใหม่จะต่อท้าย 2 ข้อความจากรอบแรก

## 2. ค่าใน config

| ค่า | ตัวอย่าง | ผล |
|---|---|---|
| `configurable.thread_id` | `"mali:งาน"`, `"mali:ส่วนตัว"` | สตริงที่ใช้เป็นคีย์ค้นหา checkpoint ของ thread |
| ข้อมูลที่ส่งเข้า `graph.invoke(input, config)` | `{ messages: [new HumanMessage(text)] }` | ข้อความใหม่ที่จะเพิ่มใน thread ที่เลือก |
| `graph.getState(config)` | `{ configurable: { thread_id: "mali:งาน" } }` | อ่าน State ของห้องงานมาลี |

เครื่องหมาย `:` เป็นส่วนหนึ่งของรหัสตัวอย่าง เราเลือกใช้เพื่อให้อ่านชื่อผู้ใช้และหัวข้อได้ง่าย Checkpointer ใช้รหัสทั้งสตริงเป็นคีย์

## 3. ลองเปลี่ยนรหัสของรอบที่สาม

| รหัสที่ส่งในรอบที่สาม | จำนวนข้อความที่ได้ | ประวัติที่ใช้ |
|---|---:|---|
| `"mali:งาน"` | 4 | ประวัติของรอบแรก |
| `"somchai:งาน"` | 4 | ประวัติของรอบที่สอง |
| `"mali:ส่วนตัว"` | 2 | ห้องใหม่ |

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/threads.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) แล้วแก้รหัสของรอบที่สามและรัน `pnpm play 2-03` สองแถวแรกมีจำนวนเท่ากัน ลองพิมพ์ `result.messages[0].text` เพื่อดูว่าห้องมาลีเริ่มด้วย `"ส่งรายงานแล้ว"` ส่วนห้องสมชายเริ่มด้วย `"เริ่มทำรายงาน"`

## บทถัดไป

[บท 2-04 อ่านและแก้ไข State ของ thread](../04-read-update-state/README.md)
