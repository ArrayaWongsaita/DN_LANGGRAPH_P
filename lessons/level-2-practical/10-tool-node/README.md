# บทที่ 2-10 รันคำขอจากโมเดลด้วย `ToolNode`

ใน [บท 2-09](../09-bind-tools/README.md) เราอ่านชื่อ tool แล้วเรียกเอง เมื่อ `AIMessage` ขอใช้หลาย tool ใช้ `ToolNode` ให้หาและรันแต่ละตัว แล้วส่งผลกลับเป็น `ToolMessage` ตาม ID ของคำขอ

## 1. ส่งคำขอบวกเลขหนึ่งรายการ

เปิด [`toolNode.ts`](./toolNode.ts) แล้วเติมข้อ 1 ให้ `node` เป็น `new ToolNode(tools)` ตัวอย่างสร้างคำขอเอง ใช้ได้โดยไม่ต้องมี API key รันจากโฟลเดอร์หลักของโปรเจกต์

```sh
pnpm lesson 2-10
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
import { AIMessage, type ToolMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";

const tools = [makeAddTool(), makeWeatherTool()];
const node = new ToolNode(tools);
const request = new AIMessage({
  content: "",
  tool_calls: [
    { name: "add", args: { a: 1, b: 1 }, id: "x", type: "tool_call" },
  ],
});

const { messages }: { messages: ToolMessage[] } = await node.invoke({ messages: [request] });
console.log(JSON.stringify(messages.map(({ tool_call_id, content }) => ({ tool_call_id, content }))));
```

`ToolNode` พบ `add` แล้วส่ง `{ a: 1, b: 1 }` ให้ tool ผลที่พิมพ์แสดงเฉพาะ `tool_call_id` และ `content` [ดูเฉลย](./solution/toolNode.ts)

```text
[{"tool_call_id":"x","content":"2"}]
✅ ได้ผล 1 ข้อความสำหรับ 1 คำขอ
✅ คำขอ x ได้ผลบวก 2
```

## 2. คำขอกับผลลัพธ์มีรูปร่างอย่างไร

| ค่า | ชนิดหรือตัวอย่าง | ใช้ทำอะไร |
|---|---|---|
| `new ToolNode(tools)` | อาร์เรย์ของ tool เช่น `[makeAddTool(), makeWeatherTool()]` | ระบุว่ามี tool ตัวไหนให้รัน |
| `node.invoke(input)` | `{ messages: BaseMessage[] }` หรือ `BaseMessage[]` | หา `AIMessage` ล่าสุดในประวัติ แล้วอ่าน `tool_calls` |
| `tool_calls` | `[{ name, args, id, type: "tool_call" }]` | `name` เลือก tool, `args` ส่งค่า, `id` ระบุคำขอ |
| ผลจาก `.invoke()` | `{ messages: ToolMessage[] }` เมื่อส่งออบเจ็กต์ หรือ `ToolMessage[]` เมื่อส่งอาร์เรย์ | ในตัวอย่าง tool แต่ละตัวคืนข้อความผลลัพธ์หนึ่งรายการ |

เมื่อข้อความขอหลาย tool ตัว node เริ่มรันพร้อมกันและเก็บผลตามลำดับใน `tool_calls` ใช้ ID ต่างกันในแต่ละคำขอ เพื่อให้ผลลัพธ์จับคู่กับคำขอได้ชัดเจน

## 3. เปลี่ยนรายการคำขอแล้วเทียบผล

แทนเนื้อหาใน [`playground.ts`](./playground.ts) ด้วยโค้ดจากหัวข้อ 1 แล้วรัน `pnpm play 2-10` ทดลองเพิ่มรายการนี้ท้าย `tool_calls`

```ts
{ name: "getWeather", args: { city: "เชียงใหม่" }, id: "y", type: "tool_call" },
```

| ค่า `tool_calls` | ผลที่พิมพ์ |
|---|---|
| มีแค่ `add` ID `"x"` | `[{"tool_call_id":"x","content":"2"}]` |
| `add` แล้วตามด้วย `getWeather` | `[{"tool_call_id":"x","content":"2"},{"tool_call_id":"y","content":"อากาศเย็น 22 องศา"}]` |
| `[]` | `[]` |

## การบ้าน

สลับสองรายการใน `tool_calls` แล้วรัน `pnpm play 2-10` ตรวจว่าผลเรียงเป็น `y` แล้ว `x` และดูว่า ID ของแต่ละผลยังตรงกับคำขอเดิม

[บทก่อนหน้า 2-09 ผูก tools กับโมเดล](../09-bind-tools/README.md) · [บทถัดไป 2-11 ต่อวง ReAct](../11-react-loop/README.md)
