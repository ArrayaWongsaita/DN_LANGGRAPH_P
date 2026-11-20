# บทที่ 2-02 ใช้ checkpointer เก็บประวัติข้ามรอบ

ใน [บท 2-01](../01-messages-state/README.md) การเรียก graph แต่ละครั้งมี State ของตัวเอง ถ้าต้องการให้รอบถัดไปอ่านการสนทนาเดิม ให้ compile graph พร้อม checkpointer แล้วใช้รหัสบทสนทนาเดิมในการเรียกแต่ละรอบ

## 1. ลองคุยสองรอบในบทสนทนาเดียว

เติมข้อ 1 ใน [`memory.ts`](./memory.ts) ให้ `compile()` ใช้ `MemorySaver` แล้วรัน ตัวอย่างใช้คำตอบที่กำหนดไว้เองและไม่ต้องมี API key

```sh
pnpm lesson 2-02
```

ต่อจาก builder ของ graph ที่มี node `chat` ให้ทำดังนี้

```ts
const checkpointer = new MemorySaver();
const graph = builder.compile({ checkpointer });
const config = { configurable: { thread_id: "mali" } };

const first = await graph.invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] }, config);
const second = await graph.invoke({ messages: [new HumanMessage("ฉันชอบแมว")] }, config);
const snapshot = await graph.getState(config);
const savedMessages: BaseMessage[] = snapshot.values.messages ?? [];
```

```text
จำนวนข้อความแต่ละรอบ [ 2, 4 ]
ใน checkpoint [ 'ฉันชื่อมาลี', 'รับทราบ', 'ฉันชอบแมว', 'รับทราบ' ]
```

รอบแรกมีผู้ใช้กับ AI รวม 2 ข้อความ เมื่อรอบสองใช้ `config` เดิม graph จะอ่าน 2 ข้อความนั้นก่อนเพิ่มคำถามและคำตอบใหม่ จึงได้ 4 ข้อความ

## 2. ค่าที่เชื่อมกัน

| ตำแหน่ง | ตัวอย่างค่า | ทำหน้าที่อะไร |
|---|---|---|
| `compile({ checkpointer })` | `new MemorySaver()` | เก็บ checkpoint ในหน่วยความจำของโปรแกรม |
| `configurable.thread_id` ใน `invoke()` | `"mali"` หรือสตริงอื่นที่ตั้งเอง | เลือกบทสนทนาที่จะอ่านและเขียน |
| `getState(config)` | ส่ง config ของบทสนทนาเดิม | คืน snapshot ล่าสุดที่มีข้อมูลใน `values` |

`MemorySaver` มีอายุเท่ากับอินสแตนซ์ที่สร้างไว้ หากเปิดโปรแกรมใหม่จะได้ saver ตัวใหม่ [เอกสาร LangGraph เรื่อง persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence)

## 3. เปรียบเทียบจำนวนข้อความ

| การตั้งค่า | รอบแรก | รอบสอง |
|---|---:|---:|
| `compile()` เหมือนบทก่อน | 2 | 2 |
| `MemorySaver` และใช้ thread `"mali"` ทั้งสองรอบ | 2 | 4 |
| `MemorySaver` และเปลี่ยนเป็น thread ใหม่ในรอบสอง | 2 | 2 |

คัดลอกโค้ดหลัง import จาก [เฉลย](./solution/memory.ts) จนถึงก่อนส่วนตรวจ ลงใน [`playground.ts`](./playground.ts) ลองแก้ `thread_id` ของรอบสองแล้วรัน `pnpm play 2-02`

## บทถัดไป

[บท 2-03 ใช้ thread_id แยกบทสนทนา](../03-thread-id/README.md)
