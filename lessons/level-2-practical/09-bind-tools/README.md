# บทที่ 2-09 ให้โมเดลขอใช้ tool ด้วย `bindTools()`

เมื่อผู้ใช้ขอให้บวก 23 กับ 19 โมเดลที่รู้จัก tool `add` สามารถส่งชื่อ tool และตัวเลขที่ต้องใช้กลับมา โปรแกรมจึงรัน tool ตามคำขอ เริ่มจาก tool ที่สร้างไว้ใน [บท 2-08](../08-define-tool/README.md)

```text
bindTools(tools) → โมเดลอ่านคำถาม → AIMessage.tool_calls → โปรแกรมรัน tool
```

## 1. ผูก tools แล้วอ่านคำขอของโมเดล

เปิด [`bind.ts`](./bind.ts) แล้วเติมข้อ 1 ให้ `bound` ได้ค่าจาก `llm.bindTools!(tools)` เตรียมโมเดลที่รองรับ tool calling และ API key ตาม [บท 1-02](../../level-1-basics/02-llm-config/README.md) แล้วรันจากโฟลเดอร์หลักของโปรเจกต์

```sh
pnpm lesson 2-09
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

```ts
const tools: StructuredToolInterface[] = [makeAddTool(), makeWeatherTool()];
const bound = llm.bindTools!(tools);
const reply = await bound.invoke([new HumanMessage("ช่วยใช้ tool add บวก 23 กับ 19")]);
const call = reply.tool_calls?.[0];
```

`bound.invoke()` คืน `AIMessage` ถ้ามีคำขอ สคริปต์จะเลือก tool จาก `call.name` แล้วส่งคำขอให้ `selected.invoke({ ...call, type: "tool_call" })` เครื่องหมาย `!` บอก TypeScript ว่าโมเดลที่เลือกมีเมธอด `bindTools`

ตัวอย่างผลที่คาดเมื่อโมเดลขอ `add` ด้วยตัวเลขทั้งสอง โมเดลอาจเรียงอาร์กิวเมนต์ต่างกันหรือส่งข้อความโดยไม่มีคำขอ tool [ดูเฉลย](./solution/bind.ts)

```text
{"name":"add","args":{"a":23,"b":19}}
ผลของ tool = 42
✅ โมเดลขอเรียก add
✅ รัน add แล้วได้ 42
```

## 2. อ่านค่าอะไรจากคำขอได้บ้าง

| ค่า | ชนิดหรือตัวอย่าง | ใช้ทำอะไร |
|---|---|---|
| `tools` | อาร์เรย์ของ tool ที่สร้างด้วย `tool()` | รายชื่อ tool ที่โมเดลขอใช้ได้ แต่ละตัวมีคำอธิบายและ schema ของตัวเอง |
| `reply.tool_calls` | `ToolCall[]` หรือ `undefined` | คำขออาจมีหลายรายการ หรือเป็นอาร์เรย์ว่าง ตัวอย่างเลือกอ่านรายการแรก |
| `call.name` | สตริง เช่น `"add"` | ใช้ค้นหา tool ในรายการที่ผูกไว้ |
| `call.args` | ออบเจ็กต์ เช่น `{ a: 23, b: 19 }` | อาร์กิวเมนต์ที่โมเดลส่งมา Schema ของ tool ตรวจค่าตอนเรียก `.invoke()` |
| `call.id` | สตริงหรือ `undefined` | ID สำหรับจับคู่กับ `tool_call_id` ในข้อความผลลัพธ์ |
| `type` | `"tool_call"` | ระบุว่าออบเจ็กต์ที่ส่งให้ tool คือคำขอทั้งรายการ ถ้าคำขอมี ID ผลจาก tool จะอยู่ใน `ToolMessage` |

การผูกด้วย `bindTools` คืนตัวเรียกโมเดลที่มีข้อมูลของ tool การตัดสินใจว่าจะส่งคำขอหรือจะตอบเป็นข้อความขึ้นกับคำถามและโมเดล

## 3. เปลี่ยนข้อความตอบกลับแล้วเทียบผล

ลองขั้นตอนหลังได้รับ `AIMessage` ได้โดยไม่ต้องมี API key แทนเนื้อหาใน [`playground.ts`](./playground.ts) ด้วยบล็อกนี้เพื่อใช้ข้อความตัวอย่าง แล้วรัน `pnpm play 2-09` โค้ดเรียก tool จริงด้วยข้อมูลในเครื่อง

```ts
import { AIMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";

const tools: StructuredToolInterface[] = [makeAddTool(), makeWeatherTool()];
const replies = [
  new AIMessage({
    content: "",
    tool_calls: [
      { name: "add", args: { a: 23, b: 19 }, id: "sum", type: "tool_call" },
    ],
  }),
  new AIMessage({
    content: "",
    tool_calls: [
      { name: "getWeather", args: { city: "เชียงใหม่" }, id: "weather", type: "tool_call" },
    ],
  }),
  new AIMessage("สวัสดี"),
];

for (const reply of replies) {
  const call = reply.tool_calls?.[0];
  if (!call) {
    console.log("ข้อความ =", reply.text);
    continue;
  }
  const selected = tools.find((item) => item.name === call.name);
  if (!selected) throw new Error(`ไม่มี tool ชื่อ ${call.name}`);
  const result = await selected.invoke({ ...call, type: "tool_call" });
  console.log(call.name, "→", result.text);
}
```

```text
add → 42
getWeather → อากาศเย็น 22 องศา
ข้อความ = สวัสดี
```

## การบ้าน

เปลี่ยน `city` ในตัวอย่างออฟไลน์เป็น `"ภูเก็ต"` แล้วรัน `pnpm play 2-09` ตรวจว่าคำขอ `getWeather` ให้ผล `ไม่มีข้อมูลของ ภูเก็ต` ส่วนข้อความทักทายยังผ่านทางที่ไม่มีคำขอ tool

[บทก่อนหน้า 2-08 สร้าง tool](../08-define-tool/README.md) · [บทถัดไป 2-10 รันคำขอด้วย ToolNode](../10-tool-node/README.md)
