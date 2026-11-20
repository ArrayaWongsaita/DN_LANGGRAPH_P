# บทที่ 2-05 ตัดประวัติก่อนส่งให้ LLM ด้วย `trimMessages`

สมมติว่ามาลีบอกชื่อไว้ตอนเริ่มแชต แล้วคุยเรื่องแมวกับเชียงใหม่ต่อ ถ้าส่งประวัติทั้งหมดให้ LLM ทุกครั้ง ข้อความเดิมจะกินพื้นที่ใน context ซ้ำทุกรอบ บทนี้ใช้ `trimMessages` เลือกเฉพาะช่วงที่อยู่ในงบ แล้วส่งช่วงนั้นให้ LLM ส่วนบทสนทนาเต็มยังอยู่ใน State ของ thread และยังอ่านย้อนหลังได้ด้วยวิธีจาก [บท 2-04](../04-read-update-state/README.md)

```text
State อ่าน state.messages ──► trimMessages ──► recent ──► llm.invoke(recent)
State เก็บคำตอบรอบนี้     ◄──────────────────────────────────────── reply
```

## 1. ลองตัดประวัติแบบนับจำนวนข้อความ

ในตัวอย่างนี้ `tokenCounter` คืนจำนวนข้อความ ดังนั้น `maxTokens: 3` หมายถึงงบ **3 ข้อความ** เปิด [`trim.ts`](./trim.ts) แล้วเติมข้อ 1 ให้ `tokenCounter` คืนจำนวนสมาชิกใน `messages` จากนั้นรันคำสั่งนี้จากโฟลเดอร์หลักของโปรเจกต์ ใช้ได้โดยไม่ต้องมี API key

```sh
pnpm lesson 2-05
```

โค้ดส่วนหลักหลังเติมข้อ 1

```ts
import { AIMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";

const history = [
  new SystemMessage({ id: "S", content: "ตอบสั้น ๆ" }),
  new HumanMessage({ id: "H1", content: "ฉันชื่อมาลี" }),
  new AIMessage({ id: "A1", content: "สวัสดีมาลี" }),
  new HumanMessage({ id: "H2", content: "ฉันชอบแมว" }),
  new AIMessage({ id: "A2", content: "แมวน่ารักดีนะ" }),
  new HumanMessage({ id: "H3", content: "ฉันอยู่เชียงใหม่" }),
  new AIMessage({ id: "A3", content: "เชียงใหม่น่าเที่ยว" }),
];

const budget = {
  maxTokens: 3,
  tokenCounter: (messages: BaseMessage[]) => messages.length,
};

const recent = await trimMessages(history, {
  ...budget,
  strategy: "last",
  startOn: "human",
});

const recentIds = recent.map((message) => message.id);
console.log(recentIds);
console.log(JSON.stringify(recent.map(({ type, content }) => ({ type, content })), null, 2));
```

`strategy: "last"` เลือกท้าย 3 ข้อความ ได้ `[A2, H3, A3]` จากนั้น `startOn: "human"` ตัด `A2` ที่อยู่หน้าคำพูดแรกของผู้ใช้ออก จึงเหลือ 2 ข้อความ ลำดับที่ได้ยังเรียงจากเก่าไปใหม่

```text
[ 'H3', 'A3' ]
[
  {
    "type": "human",
    "content": "ฉันอยู่เชียงใหม่"
  },
  {
    "type": "ai",
    "content": "เชียงใหม่น่าเที่ยว"
  }
]
✅ นับ 1 หน่วยต่อข้อความ
✅ ได้ H3 และ A3 ตามลำดับ
```

ถ้าอยากดูโค้ดเต็ม เปิด [`solution/trim.ts`](./solution/trim.ts) ได้เลย

`await trimMessages(history, options)` คืนอาร์เรย์ของออบเจ็กต์ข้อความ (`BaseMessage[]`) ตัวอย่างใช้ `.map()` เพื่อพิมพ์ ID หรือแสดงเฉพาะชนิดกับเนื้อหา ถ้าต้องการเก็บชุดตัวเลือกไว้ใช้ซ้ำ เขียน `const trimmer = trimMessages(options)` แล้วเรียก `await trimmer.invoke(history)`

## 2. พารามิเตอร์ใส่ค่าอะไรได้บ้าง

ใส่ `maxTokens` และ `tokenCounter` ทุกครั้ง ตัวเลือกที่เหลือละได้

| พารามิเตอร์ | ค่าที่ใส่ได้และค่าเริ่มต้น | ผลต่อการตัด |
|---|---|---|
| `maxTokens` | ตัวเลข เช่น `0`, `3`, `500` | กำหนดงบสูงสุด หน่วยมาจาก `tokenCounter` |
| `tokenCounter` | ฟังก์ชันที่คืน `number` หรือ `Promise<number>` หรือออบเจ็กต์โมเดล เช่น `llm` | ฟังก์ชันรับ `BaseMessage[]` แล้วคืนยอดรวม เช่น `(messages) => messages.length` ถ้าส่งโมเดล ฟังก์ชันจะรวมผลจาก `getNumTokens` ของเนื้อหาแต่ละข้อความ |
| `strategy` | `"last"` (ค่าเริ่มต้น) หรือ `"first"` | เลือกช่วงท้ายหรือช่วงต้นของรายการตามลำดับ |
| `startOn` | ชนิดข้อความ เช่น `"human"`, คลาส เช่น `HumanMessage` หรืออาร์เรย์ เช่น `["human", "ai"]` | ใช้กับ `"last"` หลังเลือกช่วงที่อยู่ในงบแล้ว จะตัดจากด้านหน้าจนเจอชนิดที่กำหนด |
| `endOn` | ชนิดข้อความ เช่น `"ai"`, คลาส เช่น `AIMessage` หรืออาร์เรย์ เช่น `["human", "tool"]` | ตัดจากด้านท้ายจนเจอชนิดที่กำหนด สำหรับ `"last"` ทำก่อนคิดงบ ส่วน `"first"` ทำหลังคิดงบ |
| `includeSystem` | `true` หรือ `false` (ค่าเริ่มต้น) | ใช้ `true` กับ `"last"` เพื่อกันที่ให้ `SystemMessage` ถ้าอยู่ตัวแรก ข้อความนี้ใช้งบด้วย เมื่อใช้ร่วมกับ `startOn` จะหาจุดเริ่มของบทสนทนาหลังข้อความระบบ |
| `allowPartial` | `true` หรือ `false` (ค่าเริ่มต้น) | `false` เก็บทีละข้อความเต็ม ส่วน `true` ลองเก็บบางส่วนของข้อความตรงขอบที่ตัด หากงบพอสำหรับส่วนนั้น |
| `textSplitter` | ฟังก์ชันที่รับข้อความแล้วคืน `string[]` หรือ `Promise<string[]>` หรือออบเจ็กต์ที่มีเมธอด `splitText` แบบ async | มีผลตอนตัดข้อความสตริงด้วย `allowPartial: true` ค่าเริ่มต้นแบ่งตามบรรทัดและเก็บอักขระขึ้นบรรทัดใหม่ไว้ |

ชื่อชนิดข้อความที่ใช้บ่อยคือ `"human"` (ผู้ใช้), `"ai"` (โมเดล), `"system"` (คำสั่งระบบ) และ `"tool"` (ผลจากเครื่องมือ) ดูชื่อที่จะใช้ได้จาก `message.type` ถ้าส่งอาร์เรย์ให้ `startOn` หรือ `endOn` ตรงกับชนิดใดชนิดหนึ่งก็พอ [อ้างอิง API ของ LangChain JS](https://reference.langchain.com/javascript/langchain-core/messages/TrimMessagesFields)

## 3. เปลี่ยนค่าแล้วได้ข้อความไหน

นำโค้ดทั้งบล็อกจากหัวข้อ 1 ไปใช้ใน [`playground.ts`](./playground.ts) โดยเก็บ import ไว้ชุดเดียว แล้วแทน options เดิมด้วย `{ ...budget, /* ค่าจากแถวที่เลือก */ }` รัน `pnpm play 2-05` เพื่อดูผล เติม `--watch` เพื่อให้รันใหม่เมื่อบันทึกไฟล์ ผลในตารางคือ ID ที่พิมพ์ออกมาจาก `recentIds`

| ค่าที่ใส่เพิ่มจาก `budget` | ID ที่ได้ | สิ่งที่เกิดขึ้น |
|---|---|---|
| เว้นไว้ | `[A2, H3, A3]` | ใช้ค่าเริ่มต้น `"last"` จึงได้ท้าย 3 ข้อความ |
| `strategy: "first"` | `[S, H1, A1]` | เก็บ 3 ข้อความแรก |
| `startOn: "human"` หรือ `startOn: HumanMessage` | `[H3, A3]` | ข้าม `A2` จนเจอ `H3` |
| `startOn: ["human", "ai"]` | `[A2, H3, A3]` | `A2` ใช้เป็นจุดเริ่มได้ เพราะชนิด `"ai"` อยู่ในรายการ |
| `endOn: "human"` หรือ `endOn: HumanMessage` | `[H2, A2, H3]` | ตัด `A3` ออกก่อน แล้วจึงนับ 3 ข้อความจาก `H3` ย้อนกลับ |
| `endOn: ["human", "ai"]` | `[A2, H3, A3]` | `A3` ใช้เป็นจุดจบได้ เพราะชนิด `"ai"` อยู่ในรายการ |
| `strategy: "first", endOn: "human"` | `[S, H1]` | ได้ `[S, H1, A1]` จากงบก่อน แล้วตัด `A1` ออกจากท้าย |
| `maxTokens: 4, startOn: "human"` | `[H2, A2, H3, A3]` | ท้าย 4 ข้อความเริ่มที่ `H2` พอดี |
| `maxTokens: 4, startOn: "human", includeSystem: true` | `[S, H3, A3]` | `S` ใช้ไป 1 หน่วย เหลือที่ให้ `[A2, H3, A3]` แล้ว `startOn` ตัด `A2` |
| `maxTokens: 1, startOn: "human"` | `[]` | ในงบเหลือแค่ `A3` ซึ่งใช้เป็นจุดเริ่มไม่ได้ |
| `maxTokens: 10` | `[S, H1, A1, H2, A2, H3, A3]` | ประวัติทั้ง 7 ข้อความอยู่ในงบ |

เมื่อใช้ `includeSystem: true` ให้เผื่องบสำหรับทั้งคำสั่งระบบและบทสนทนา ใน `@langchain/core@1.4.1` ที่โปรเจกต์นี้ใช้ กรณีที่มี `S` นำหน้าแล้วตัดจนไม่เหลือข้อความตามเงื่อนไขอาจได้ `[undefined]` เช่น `maxTokens: 1, includeSystem: true, startOn: "human"` กับตัวนับจำนวนข้อความชุดนี้

## 4. เก็บบางส่วนของข้อความยาว

ถ้านับเป็นจำนวนข้อความ การตัดเนื้อหาให้สั้นลงยังใช้งบ 1 ข้อความเท่าเดิม ตัวอย่างนี้จึงเปลี่ยนตัวนับเป็นจำนวนตัวอักษรในข้อความ ASCII โดยนับ `\n` เป็น 1 ตัวด้วย จากนั้นใช้งบ 5 ตัวอักษรกับข้อความ `"ABC\nDEF\nGHI"`

```ts
import { HumanMessage, trimMessages } from "@langchain/core/messages";
import type { BaseMessage, TrimMessagesFields } from "@langchain/core/messages";

const countCharacters = (messages: BaseMessage[]) =>
  messages.reduce(
    (total, message) => total + (typeof message.content === "string" ? message.content.length : 0),
    0,
  );

async function trimText(options: Partial<TrimMessagesFields>) {
  const input = [new HumanMessage("ABC\nDEF\nGHI")];
  const result = await trimMessages(input, {
    maxTokens: 5,
    tokenCounter: countCharacters,
    ...options,
  });
  return JSON.stringify(result.map((message) => message.content));
}

console.log(await trimText({}));
console.log(await trimText({ allowPartial: true }));
console.log(await trimText({ strategy: "first", allowPartial: true }));
console.log(await trimText({ allowPartial: true, textSplitter: (text) => Array.from(text) }));
```

```text
[]
["GHI"]
["ABC\n"]
["F\nGHI"]
```

บรรทัดแรกใช้ค่าเริ่มต้นที่เก็บทีละข้อความเต็ม จึงได้ `[]` เพราะทั้งข้อความยาวเกินงบ สองบรรทัดถัดไปใช้ตัวแบ่งตามบรรทัด ได้ `"GHI"` จากท้ายและ `"ABC\n"` จากต้น บรรทัดสุดท้ายแบ่งทีละตัวอักษรจึงเก็บท้ายได้ครบ 5 ตัว ในตัวแบ่งที่เขียนเองให้เก็บช่องว่างและตัวคั่นไว้ด้วย เพราะฟังก์ชันนำชิ้นส่วนมาต่อกันโดยตรง

ตัวอย่างนี้สร้าง `HumanMessage` ใหม่ทุกครั้ง เพราะเวอร์ชันที่บทเรียนใช้สามารถแก้ `content` ของออบเจ็กต์ต้นฉบับเมื่อใช้ `strategy: "first"` พร้อม `allowPartial: true` กับข้อความสตริง

## 5. ใช้ใน node `chat` ของ LangGraph

ถ้านำไปใช้กับ graph แชตจากบท 2-02 ให้อ่านประวัติจาก `state.messages` เลือกท้ายไม่เกิน 3 ข้อความ แล้วส่ง `recent` ให้โมเดล เมื่อได้คำตอบ ให้คืนคำตอบใหม่เพียงรายการเดียวเพื่อให้ `MessagesValue` ต่อท้าย State

```ts
.addNode("chat", async (state) => {
  const recent = await trimMessages(state.messages, {
    maxTokens: 3,
    tokenCounter: (messages) => messages.length,
    strategy: "last",
    startOn: "human",
  });

  const reply = await llm.invoke(recent);
  return { messages: [reply] };
})
```

`MessagesValue` รวมข้อความตาม ID การคืน `{ messages: recent }` จึงเป็นการส่งข้อความชุดเดิมกลับเข้า reducer ข้อความเก่าที่อยู่นอก `recent` ยังอยู่ ส่วนคำตอบใหม่ต้องมาจาก `llm.invoke(recent)`

| รอบ | ข้อความที่ผู้ใช้ส่ง | จำนวนข้อความใน State ตอนเข้า node | ข้อความที่ LLM ได้ |
|---|---|---:|---|
| 1 | ฉันชื่อมาลี | 1 | `[H1]` |
| 2 | ฉันชอบแมว | 3 | `[H1, A1, H2]` |
| 3 | ฉันอยู่เชียงใหม่ | 5 | `[H2, A2, H3]` |
| 4 | ฉันชื่ออะไร | 7 | `[H3, A3, H4]` |

หลังจบรอบ 4 State มี 8 ข้อความ ชื่อมาลียังอยู่ใน `H1` อินพุตของโมเดลรอบสุดท้ายมีเพียง `[H3, A3, H4]` จึงไม่มีข้อความที่บอกชื่อมาลี บทถัดไปจะใช้สรุปเพื่อพาข้อมูลเก่าที่สำคัญไปด้วย

## บทถัดไป

[บท 2-06 สรุปข้อความเก่าแทนการทิ้ง](../06-summarize/README.md)
