# บทที่ 2-15 เลือกโมเดลและเครื่องมือตอนรับคำถาม

คำทักทายกับคำถามเรื่องอากาศอาจใช้โมเดลและเครื่องมือคนละชุด บทนี้ให้ node เลือกทั้งสองอย่างจากข้อความที่ได้รับ แล้วใช้ `bindTools` จาก [บท 2-09](../09-bind-tools/README.md) ส่งรายการเครื่องมือให้โมเดลที่เลือก

## 1. ลองส่งคำถามสองแบบเข้า node เดียว

เติมข้อ 1 ใน [`dynamic.ts`](./dynamic.ts) ให้ `choose` คืนโมเดลและรายการเครื่องมือตามกติกา แล้วรันจากโฟลเดอร์หลัก ผลตรวจท้ายไฟล์ควรขึ้น ✅ ทั้งสามบรรทัด

```sh
pnpm lesson 2-15
```

ใน [`dynamic.ts`](./dynamic.ts) มีโมเดลตามสคริปต์สองออบเจ็กต์ เครื่องมือ `add` กับ `getWeather` และ graph ที่เรียก `choose` ก่อนส่งคำถาม โค้ดส่วนหลักหลังเติมฟังก์ชันมีดังนี้

```ts
function choose(question: string): { model: "cheap" | "strong"; tools: typeof allTools } {
  const model = question.length > 30 ? "strong" : "cheap";
  const tools = allTools.filter((tool) => tool.name !== "getWeather" || question.includes("อากาศ"));
  return { model, tools };
}

// ใน node chat
const { model, tools } = choose(state.messages[0].text);
const reply = await models[model].bindTools(tools).invoke(state.messages);
return { model, tools: tools.map((tool) => tool.name), messages: [reply] };
```

ผลจากการรันสองคำถามในไฟล์

```text
{"question":"สวัสดี","model":"cheap","tools":["add"],"reply":"คำตอบจาก cheap"}
{"question":"ช่วยบอกอากาศของกรุงเทพวันนี้ให้หน่อยว่าร้อนแค่ไหน","model":"strong","tools":["add","getWeather"],"reply":"คำตอบจาก strong"}
```

ชื่อ `cheap` และ `strong` เป็นป้ายสำหรับดูว่า node เรียกออบเจ็กต์ไหน คำตอบกำหนดไว้ในสคริปต์ จึงรันซ้ำได้โดยไม่ต้องตั้ง API key ในบทนี้ `bindTools` ทำให้โมเดลเห็นเครื่องมือ ส่วนการเรียกเครื่องมือต้องมี node อย่าง `ToolNode` ใน [บท 2-10](../10-tool-node/README.md)

## 2. เปลี่ยนค่าอะไรได้บ้าง

| จุดที่เลือก | ค่าในบทนี้ | ผล |
|---|---|---|
| `question.length` | `number` เทียบกับ `30` | ตั้งแต่ 0 ถึง 30 ใช้ `cheap` ตั้งแต่ 31 ใช้ `strong` ใช้หน่วยความยาวของสตริงใน JavaScript |
| คำว่า `"อากาศ"` | `string` ที่ใช้กับ `includes` | ถ้าพบคำนี้ โมเดลเห็นทั้ง `add` และ `getWeather` |
| `models[model]` | ออบเจ็กต์ที่มี `bindTools` และ `invoke` | เปลี่ยนเป็นโมเดลจากการตั้งค่าที่รองรับเครื่องมือได้ทั้งสองตำแหน่ง |
| `bindTools(tools)` | อาร์เรย์ของ tool objects | โมเดลได้รับชื่อ คำอธิบาย และ schema ของเครื่องมือที่เลือก |

## 3. เปลี่ยนคำถามแล้วเทียบสองเงื่อนไข

คัดลอกโค้ดส่วนหลัง import จากเฉลยลง [`playground.ts`](./playground.ts) ตัดส่วนตรวจออก แล้วรัน `pnpm play 2-15` เปลี่ยนรายการคำถามใน `for` เป็น `["อากาศ", "a".repeat(31)]`

| คำถาม | โมเดลและคำตอบ | เครื่องมือ |
|---|---|---|
| `"อากาศ"` | `cheap` พิมพ์ `"คำตอบจาก cheap"` | `["add","getWeather"]` |
| `"a".repeat(31)` | `strong` พิมพ์ `"คำตอบจาก strong"` | `["add"]` |

กติกาเลือกโมเดลดูความยาว ส่วนกติกาเลือกเครื่องมือดูคำที่อยู่ในข้อความ จึงเปลี่ยนผลแต่ละอย่างแยกกันได้

[ดูเฉลย](./solution/dynamic.ts) · [บทก่อนหน้า 2-14 คำตอบแบบมีโครงสร้าง](../14-structured-final/README.md) · [บทถัดไป 2-16 ประกอบ agent ด้วย createAgent](../16-create-agent/README.md)
