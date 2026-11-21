# บทที่ 2-07 เก็บ checkpoint ลงไฟล์ด้วย `SqliteSaver`

[บท 2-02](../02-checkpointer/README.md) เก็บ checkpoint ไว้ใน `MemorySaver` ของโปรแกรม เมื่ออยากปิดแล้วกลับมาคุยต่อ ให้เก็บ checkpoint ลงไฟล์ SQLite และเปิดไฟล์เดิมด้วย `thread_id` เดิม

## 1. ลองปิดแล้วเปิดฐานข้อมูลเดิม

เปิด [`persistent.ts`](./persistent.ts) แล้วเติมข้อ 1 ให้สร้าง saver จาก `storage` ของแต่ละรอบ รันได้ในเครื่องโดยไม่ต้องมี API key ไฟล์ตัวอย่างสร้างฐานข้อมูลในโฟลเดอร์ชั่วคราวที่จัดให้เฉพาะรอบนี้

```sh
pnpm lesson 2-07
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในแต่ละรอบ โค้ดจะสร้าง saver และ graph จากนั้นเรียก graph แล้วปิดการเชื่อมต่อ

```ts
const saver = SqliteSaver.fromConnString(storage);
try {
  const graph = builder.compile({ checkpointer: saver });
  const result = await graph.invoke({ messages: [new HumanMessage(text)] }, config);
  console.log(label, result.messages.length);
} finally {
  saver.db.close();
}
```

```text
เปิดไฟล์ครั้งแรก 2
เปิดไฟล์เดิมใหม่ 4
เปิดฐานข้อมูลใน RAM 2
```

รอบสองได้ graph ตัวใหม่และเปิดการเชื่อมต่อใหม่ ประวัติรอบแรกยังอยู่ในไฟล์เดิม จึงอ่านมาต่อได้ 4 ข้อความ

## 2. ค่าที่ใช้เลือกประวัติ

| โค้ด | ตัวอย่างค่า | ผล |
|---|---|---|
| `SqliteSaver.fromConnString(storage)` | path ไปยังไฟล์ เช่น `"./memory.db"` | เปิดไฟล์เดิมหรือสร้างฐานข้อมูลใหม่เมื่อยังไม่มีไฟล์ |
| `SqliteSaver.fromConnString(storage)` | `":memory:"` | สร้างฐานข้อมูลใน RAM สำหรับการเชื่อมต่อนั้น |
| `builder.compile({ checkpointer: saver })` | อินสแตนซ์ `SqliteSaver` | ใช้ฐานข้อมูลนี้บันทึกและอ่าน State |
| `configurable.thread_id` | `"mali"` | เลือกบทสนทนาภายในฐานข้อมูลที่เปิดอยู่ |

อ่านรายละเอียดของตัวสร้าง saver ได้ใน [อ้างอิง `SqliteSaver.fromConnString`](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-sqlite/SqliteSaver/fromConnString)

## 3. ลองเปลี่ยนไฟล์หรือรหัสบทสนทนา

สมมติว่าไฟล์ `memory.db` มี 2 ข้อความของห้อง `"mali"` อยู่แล้ว

| ที่เก็บตอนเรียกครั้งถัดไป | `thread_id` | ข้อความหลัง graph ตอบ |
|---|---|---:|
| `memory.db` | `"mali"` เดิม | 4 |
| `memory.db` | `"somchai"` ห้องใหม่ | 2 |
| ไฟล์ใหม่หรือ `":memory:"` ตัวใหม่ | `"mali"` | 2 |

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/persistent.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) แล้วแก้ค่ารอบที่สองและรัน `pnpm play 2-07`

## บทถัดไป

[บท 2-08 สร้าง tool ด้วย schema ที่ตรวจอินพุตได้](../08-define-tool/README.md)
