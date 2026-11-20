# บทที่ 2-04 อ่านและแก้ไข State ของ thread

ใน [บท 2-03](../03-thread-id/README.md) เราใช้รหัสเลือกห้องแชต คราวนี้จะอ่านประวัติของห้องนั้นจากนอก graph แล้วใช้ ID ลบข้อความหนึ่งรายการจาก State ล่าสุด

## 1. ลองลบข้อความตาม ID

เปิด [`state.ts`](./state.ts) แล้วเติมข้อ 1 ให้ลบข้อความ `h1` จาก thread `"mali"` จากนั้นรันโดยไม่ต้องมี API key

```sh
pnpm lesson 2-04
```

ไฟล์สร้างประวัติไว้แล้ว ข้อความ `h1` คือ `"ฉันชอบแมว"` และ `h2` คือ `"ฉันชอบสุนัข"` แต่ละรอบมีคำตอบตัวอย่าง `"รับทราบ"`

```ts
const config = { configurable: { thread_id: "mali" } };

const before: BaseMessage[] = (await graph.getState(config)).values.messages ?? [];
const removal = new RemoveMessage({ id: "h1" });
await graph.updateState(config, { messages: [removal] });
const after: BaseMessage[] = (await graph.getState(config)).values.messages ?? [];
```

```text
ก่อนลบ [ 'ฉันชอบแมว', 'รับทราบ', 'ฉันชอบสุนัข', 'รับทราบ' ]
หลังลบ [ 'รับทราบ', 'ฉันชอบสุนัข', 'รับทราบ' ]
```

`updateState()` ส่ง update ผ่านตัวรวมของ `MessagesValue` การลบจึงมีผลเฉพาะข้อความที่ ID ตรงกัน คำตอบถัดจาก `h1` ยังอยู่

## 2. ค่าและผลของคำสั่ง

| คำสั่งหรือค่า | ใส่อะไร | สิ่งที่ได้ |
|---|---|---|
| `graph.getState(config)` | config ที่มี `thread_id` | snapshot ของ thread ข้อความอยู่ที่ `snapshot.values.messages` |
| `?? []` | ใช้หลัง `snapshot.values.messages` | อาร์เรย์ว่างเมื่อ thread ยังไม่มีค่าข้อความ |
| `graph.updateState(config, { messages: [...] })` | config และรายการที่ต้องการรวมเข้า State | checkpoint ที่เก็บ State หลังปรับแก้ |
| `new RemoveMessage({ id: "h1" })` | ID ของข้อความที่มีอยู่ | คำสั่งลบข้อความสำหรับตัวรวมของ `MessagesValue` |

## 3. เปรียบเทียบการเปลี่ยน State

ใช้ประวัติเดิม 4 ข้อความในแต่ละกรณี

| ค่าภายใน `messages` ของ update | จำนวนหลังอัปเดต | ผลที่เห็น |
|---|---:|---|
| `[new RemoveMessage({ id: "h1" })]` | 3 | คำว่า `"ฉันชอบแมว"` หาย |
| `[new RemoveMessage({ id: "h2" })]` | 3 | คำว่า `"ฉันชอบสุนัข"` หาย |
| `[new HumanMessage({ id: "h1", content: "ฉันชอบนก" })]` | 4 | เนื้อหาที่ ID `h1` กลายเป็น `"ฉันชอบนก"` |
| `[new HumanMessage("ฉันชอบปลา")]` | 5 | ข้อความใหม่ต่อท้าย |

บทนี้แก้ State ที่จะถูกอ่านต่อใน thread ระบบยังอาจมี checkpoint เก่าอยู่ในประวัติ [เอกสาร LangGraph เรื่อง persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence)

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/state.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) แล้วลองสลับ ID ที่จะลบและรัน `pnpm play 2-04`

## บทถัดไป

[บท 2-05 ตัดประวัติก่อนส่งให้ LLM](../05-trim-messages/README.md)
