# บทที่ 2-05 ตัดประวัติก่อนส่งให้ LLM ด้วย `trimMessages`

## 1. ทำไมต้องตัด

ทุกรอบที่คุย ข้อความถูกต่อท้ายเข้า State และถ้าส่ง `state.messages` ทั้งหมดให้ LLM ทุกครั้ง ยิ่งคุยนานยิ่งส่งมาก

| รอบที่ | ข้อความที่ส่งให้ LLM | ผล |
|---:|---:|---|
| 1 | 1 | เร็ว ถูก |
| 10 | 19 | ช้าลง |
| 100 | 199 | ช้า แพง (คิดเงินตามจำนวน token) และอาจเกินความจุของโมเดล |

ทางออกที่ง่ายที่สุดคือ **ส่งให้ LLM แค่ข้อความล่าสุดบางส่วน** ส่วนบทสนทนาเต็มยังเก็บอยู่ใน State เหมือนเดิม (อ่านย้อนหลังได้ด้วยวิธีจาก [บท 2-04](../04-read-update-state/README.md))

```text
State (เก็บครบ)                           สิ่งที่ส่งให้ LLM
S  H1  A1  H2  A2  H3  A3     ──ตัด──►    ·   ·   ·   ·  A2  H3  A3
```

เครื่องมือที่ใช้ตัดคือ `trimMessages` สิ่งสำคัญที่สุดของบทนี้คือ **ตัดเฉพาะสำเนาที่ส่งให้ LLM ไม่แตะ State**

## 2. ลองตัดด้วยตัวเอง

ชื่อข้อความย่อดังนี้: `S` = คำสั่งระบบ, `H` = ผู้ใช้ (human), `A` = คำตอบ AI ตัวอย่างใช้ประวัติ 7 ข้อความชุดนี้ตลอดทั้งบท

```ts
const history = [
  new SystemMessage({ id: "S",  content: "ตอบสั้น ๆ" }),
  new HumanMessage({ id: "H1", content: "ฉันชื่อมาลี" }),
  new AIMessage({ id: "A1", content: "สวัสดีมาลี" }),
  new HumanMessage({ id: "H2", content: "ฉันชอบแมว" }),
  new AIMessage({ id: "A2", content: "แมวน่ารักดีนะ" }),
  new HumanMessage({ id: "H3", content: "ฉันอยู่เชียงใหม่" }),
  new AIMessage({ id: "A3", content: "เชียงใหม่น่าเที่ยว" }),
];
```

เปิด [`trim.ts`](./trim.ts) มี 1 ข้อให้เติม (ค้นหา `// 👉 ข้อ 1`) แล้วรันจากโฟลเดอร์หลักของโปรเจกต์ (ไม่ต้องมี API key)

```sh
pnpm lesson 2-05
```

โจทย์: เรียก `trimMessages` ให้เหลือข้อความล่าสุดไม่เกิน 3 ข้อความ และต้องขึ้นต้นด้วยข้อความของผู้ใช้ ไฟล์มี `countMessages` ให้แล้ว คือ `tokenCounter` ที่บอกว่ารายการข้อความ "ใช้งบไปเท่าไร" ในบทนี้นับ 1 ข้อความ = 1 หน่วย (ของจริงมักนับ token ตามโมเดล) จึงได้ `maxTokens: 3` = งบ 3 ข้อความ

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ให้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย ก่อนทำลองอ่านว่าแต่ละตัวเลือกทำอะไร (หัวข้อ 3 อธิบาย `startOn`)

รูปแบบของคำสั่ง

```ts
const recent = await trimMessages(history, {
  maxTokens: ...,      // งบสูงสุด
  tokenCounter: ...,   // ฟังก์ชันนับงบ
  strategy: ...,       // "last" เก็บท้าย ทิ้งต้น / "first" เก็บต้น ทิ้งท้าย
  startOn: ...,        // ชนิดข้อความที่ผลลัพธ์ต้องขึ้นต้น เช่น "human"
});
```

ผลที่ได้ควรเป็น `[H3, A3]` (หัวข้อ 3 อธิบายว่าทำไมได้ 2 ข้อความ) เมื่อทำถูกจะเห็น

```text
✅ ได้ H3 และ A3 ตามลำดับ
```

`trimMessages` เป็น async ต้องใส่ `await` และคืนอาร์เรย์ข้อความที่เรียงจากเก่าไปใหม่เหมือนเดิม ดูโค้ดเต็มได้ที่ [`solution/trim.ts`](./solution/trim.ts)

## 3. ทำไมได้ 2 ข้อความ ไม่ใช่ 3

งบคือ 3 แต่ผลมีแค่ 2 เพราะสองขั้นตอนนี้

```text
history            S  H1  A1  H2  A2  H3  A3
1) strategy "last" เลือกท้ายให้ได้ 3 ข้อความ:      [A2  H3  A3]
2) startOn "human" ข้อความแรกไม่ใช่ผู้ใช้ ทิ้งต่อ:  [    H3  A3]
```

ถ้าไม่ใส่ `startOn: "human"` โมเดลจะได้ประวัติที่ขึ้นต้นด้วยคำตอบของ AI โดยไม่มีคำถามนำ ซึ่งบางโมเดลไม่รับ จึงควรใส่เสมอ และผลที่ได้อาจน้อยกว่างบ นี่เป็นเรื่องปกติ

## 4. ใช้ใน node ของ graph แชต

นี่คือจุดที่ใช้จริง: ตัดก่อน แล้วส่ง `recent` ให้ `llm` ไม่ส่ง `state.messages`

```ts
.addNode("chat", async (state) => {
  const recent = await trimMessages(state.messages, {
    maxTokens: 3,
    tokenCounter: (messages) => messages.length,
    strategy: "last",
    startOn: "human",
  });

  const reply = await llm.invoke(recent);  // ส่งตัวที่ตัดแล้ว
  return { messages: [reply] };            // คืนเฉพาะคำตอบใหม่ ให้ต่อท้าย State
})
```

ใช้กับแชตจากบท 2-02 คุย 4 รอบ ("ฉันชื่อมาลี" → "ฉันชอบแมว" → "ฉันอยู่เชียงใหม่" → "ฉันชื่ออะไร") ได้ผลดังนี้ (ในแชตนี้ไม่มี `S`)

| รอบ | ใน State ตอนเข้า node | ข้อความที่ LLM ได้ |
|---:|---:|---|
| 1 | 1 | `[H1]` |
| 2 | 3 | `[H1, A1, H2]` |
| 3 | 5 | `[H2, A2, H3]` |
| 4 | 7 | `[H3, A3, H4]` |

หลังจบรอบ 4 State มี 8 ข้อความ ชื่อมาลียังอยู่ใน `H1` แต่ข้อความที่ส่งให้โมเดลรอบสุดท้ายคือ `[H3, A3, H4]` โมเดลจึงตอบไม่ได้ว่าชื่ออะไร นี่คือราคาของการตัด บท 2-06 สอนวิธีสรุปแทนการทิ้ง

ข้อผิดที่พบบ่อย

```ts
await llm.invoke(state.messages);                  // ❌ ส่งทั้งหมด ไม่ได้ตัดอะไรเลย
const recent = trimMessages(state.messages, opts); // ❌ ลืม await ได้ Promise ไม่ใช่ข้อความ
```

## 5. ตัวเลือกที่ใช้บ่อย

ใส่ `maxTokens` และ `tokenCounter` ทุกครั้ง ที่เหลือใส่เมื่อต้องการ ตารางนี้ใช้ `history` ชุดเดิมกับ `maxTokens: 3` เว้นแต่ระบุไว้ ลองใน [`playground.ts`](./playground.ts) ด้วย `pnpm play 2-05` ได้เลย

| ตัวเลือก | ความหมาย | ID ที่ได้ |
|---|---|---|
| (ไม่ใส่อะไรเพิ่ม) | `strategy` เริ่มต้นคือ `"last"` | `[A2, H3, A3]` |
| `strategy: "first"` | เก็บท้ายหรือต้น: ตัวนี้เก็บ 3 ข้อความแรก | `[S, H1, A1]` |
| `startOn: "human"` | ทิ้งจากหน้าจนเจอข้อความผู้ใช้ | `[H3, A3]` |
| `maxTokens: 4, startOn: "human"` | งบพอดีกับจุดเริ่ม จึงได้เต็มงบ | `[H2, A2, H3, A3]` |
| `maxTokens: 4, startOn: "human", includeSystem: true` | กันที่ให้ `S` (กินงบ 1 หน่วย) | `[S, H3, A3]` |
| `maxTokens: 1, startOn: "human"` | งบเหลือแค่ `A3` ซึ่งเริ่มไม่ได้ | `[]` |
| `maxTokens: 10` | ประวัติทั้งหมดอยู่ในงบ จึงไม่ถูกตัด | `[S, H1, A1, H2, A2, H3, A3]` |

`includeSystem: true` ใช้กับ `"last"` เพื่อไม่ให้คำสั่งระบบหายไปเมื่อประวัติยาว ให้เผื่องบสำหรับทั้งคำสั่งระบบและบทสนทนา

## 6. เจาะลึก (อ่านเมื่อจำเป็น)

**ตัวเลือกอื่น**

| ตัวเลือก | ความหมาย |
|---|---|
| `startOn` / `endOn` ส่งเป็นอาร์เรย์ | เช่น `["human", "ai"]` ตรงกับชนิดใดชนิดหนึ่งก็พอ ชนิดที่ใช้บ่อย: `"human"`, `"ai"`, `"system"`, `"tool"` ดูชื่อได้จาก `message.type` |
| `endOn` | ตัดจากท้ายจนเจอชนิดที่กำหนด เช่น `endOn: "human"` กับ `history` ได้ `[H2, A2, H3]` (ตัด `A3` ก่อนแล้วนับงบ) |
| `tokenCounter` เป็นโมเดล | ส่ง `llm` ได้ จะนับ token จริงด้วย `getNumTokens` |
| `allowPartial` | `true` ลองเก็บบางส่วนของข้อความตรงขอบที่ตัด ค่าเริ่มต้น `false` เก็บทีละข้อความเต็ม |
| `textSplitter` | ใช้คู่กับ `allowPartial: true` กำหนดวิธีแบ่งข้อความ ค่าเริ่มต้นแบ่งตามบรรทัด |

[อ้างอิง API ของ LangChain JS](https://reference.langchain.com/javascript/langchain-core/messages/TrimMessagesFields)

**เก็บบางส่วนของข้อความยาว**

ถ้านับเป็นจำนวนข้อความ การตัดเนื้อหาให้สั้นลงยังใช้งบ 1 ข้อความเท่าเดิม ตัวอย่างนี้จึงนับเป็นจำนวนตัวอักษร (นับ `\n` เป็น 1 ตัว) ใช้งบ 5 ตัวอักษรกับข้อความ `"ABC\nDEF\nGHI"`

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

บรรทัดแรกใช้ค่าเริ่มต้นที่เก็บทีละข้อความเต็ม จึงได้ `[]` เพราะทั้งข้อความยาวเกินงบ สองบรรทัดถัดไปแบ่งตามบรรทัด ได้ `"GHI"` จากท้ายและ `"ABC\n"` จากต้น บรรทัดสุดท้ายแบ่งทีละตัวอักษรจึงเก็บท้ายได้ครบ 5 ตัว ในตัวแบ่งที่เขียนเอง ให้เก็บช่องว่างและตัวคั่นไว้ด้วย เพราะฟังก์ชันนำชิ้นส่วนมาต่อกันโดยตรง

**ข้อควรระวังเรื่องเวอร์ชัน (`@langchain/core@1.4.1` ที่โปรเจกต์นี้ใช้)**
- กรณีที่มี `S` นำหน้าแล้วตัดจนไม่เหลือข้อความตามเงื่อนไข อาจได้ `[undefined]` เช่น `maxTokens: 1, includeSystem: true, startOn: "human"` กับตัวนับจำนวนข้อความชุดนี้
- ใช้ `strategy: "first"` พร้อม `allowPartial: true` กับข้อความสตริง ไลบรารีอาจแก้ `content` ของออบเจ็กต์ต้นฉบับ ตัวอย่างข้างบนจึงสร้าง `HumanMessage` ใหม่ทุกครั้ง

## คุณทำได้แล้ว
- ตัดประวัติด้วย `trimMessages` โดยไม่ทำให้ความจำจริงใน State หาย

## ข้อควรจำ
- ตัดเฉพาะ "สิ่งที่ส่งให้ LLM" ไม่ใช่ "สิ่งที่เก็บ"
- ต้อง `await` และควรใส่ `startOn: "human"` เสมอ
- ตัดแล้วโมเดลลืมของเก่าไปเลย

## บทถัดไป

[บท 2-06 สรุปข้อความเก่าแทนการทิ้ง](../06-summarize/README.md)
