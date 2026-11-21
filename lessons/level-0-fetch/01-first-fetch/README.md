# บทที่ 0-01 ส่งคำขอแรกด้วย `fetch`

สมมติว่าอยากให้แอปเขียนคำทักทายสำหรับคนที่เพิ่งเริ่มเรียน LLM บทนี้ส่งคำขอ HTTP ไปยังโมเดลที่ตั้งใน `.env` แล้วหยิบเฉพาะข้อความคำตอบมาแสดง

## 1. ส่งคำถามหนึ่งข้อความ

เปิด [`callLLM.ts`](./callLLM.ts) แล้วเติมข้อ 1 ให้ส่งคำขอด้วย `fetch`

เตรียมก่อนรัน: ติดตั้งแพ็กเกจด้วย `pnpm install` และสร้าง `.env` จาก [`.env.example`](../../../.env.example) ถ้ายังไม่มี ตัวอย่าง Level 0 ใช้ `LLM_PROVIDER` เป็น `groq`, `google` หรือ `deepseek` ซึ่งรับคำขอ Chat Completions พร้อม API key แบบ Bearer ใส่ key ของผู้ให้บริการที่เลือก แล้วรันจากโฟลเดอร์หลัก ดู [การตั้งค่าผู้ให้บริการ](../../../README.md#switching-llm-provider-or-model)

ถ้า `.env` ตั้งเป็น `opencode` คำขอใน Level 0 จะได้ `HTTP 400` เพราะ provider นี้ต้องมี header `x-opencode-session` ซึ่งมีเฉพาะใน `getLLM()` ของ Level 1 ขึ้นไป ให้ใช้ provider อื่นกับบท 0 เช่น `LLM_PROVIDER=groq pnpm lesson 0-01` หรือแก้ค่าใน `.env` ชั่วคราว

```sh
pnpm lesson 0-01
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ไฟล์มี `chatUrl`, `apiKey` และ `model` จาก `describeProvider()` ให้แล้ว ส่วน `messages` มีคำถามภาษาไทยหนึ่งข้อความ โค้ดส่วนที่ส่งคำขอและอ่านคำตอบมีหน้าตาแบบนี้

```ts
const response = await fetch(chatUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ model, messages }),
});

if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
const answer = data.choices?.[0]?.message?.content;
```

`await fetch(...)` รอรับ `Response` ส่วน `await response.json()` อ่านเนื้อหาของ `Response` แล้วแปลงจาก JSON เป็นข้อมูลที่ JavaScript ใช้ได้

## 2. ดูสถานะและคำตอบ

ตัวอย่างผลจากคำขอที่สำเร็จ ข้อความบรรทัดที่สองขึ้นกับโมเดล

```text
HTTP 200
สวัสดี ยินดีต้อนรับสู่การเขียนแอป LLM!
✅ ส่งคำขอสำเร็จ
✅ ได้คำตอบเป็นข้อความที่มีเนื้อหา
```

ถ้าตั้งค่า `.env` แล้วเริ่มรันโดยยังเว้นช่องข้อ 1 อยู่ สคริปต์จะแสดง `❌ ยังไม่ได้ทำข้อ 1` เมื่อเติมเสร็จให้รันอีกครั้งแล้วดูผลตรวจท้ายไฟล์

## 3. ส่วนต่าง ๆ ของคำขอ

| ส่วน | ค่าที่ใช้ | หน้าที่ |
|---|---|---|
| URL | `chatUrl` จาก `describeProvider()` | ระบุปลายทางของโมเดลที่ตั้งไว้ |
| `method` | `"POST"` | ส่งข้อมูลใน body |
| `Authorization` | สตริงรูปแบบ `Bearer <API key>` | ยืนยันตัวตนด้วย key จาก `.env` |
| `Content-Type` | `"application/json"` | ระบุรูปแบบของ body |
| `model` | สตริงจาก `LLM_MODEL` หรือค่าเริ่มต้นของบริการที่เลือก | ระบุโมเดลที่จะตอบ |
| `messages` | อาร์เรย์ของออบเจ็กต์ เช่น `{ role: "user", content: question }` | ส่งบทสนทนา ตัวอย่างนี้มีคำถามเดียว |
| `choices[0].message.content` | ข้อความในคำตอบรายการแรก | อ่านหลังยืนยันว่า `response.ok` เป็น `true` |

## 4. เปลี่ยนคำถามแล้วเทียบคำตอบ

ก่อนทดลอง ให้นำโค้ดจากเฉลยตั้งแต่หลัง import ถึงก่อนส่วนตรวจคำตอบไปใส่ใน `playground.ts`

ใช้ URL และโมเดลเดิม เปลี่ยนเฉพาะ `content` แล้วดูค่าที่อ่านจาก `choices[0].message.content`

| `content` ที่ส่ง | ตัวอย่างข้อความที่ได้ |
|---|---|
| `"ทักทายคนที่เพิ่งเริ่มเรียนเขียนแอป LLM หนึ่งประโยค"` | `สวัสดี ยินดีต้อนรับสู่การเขียนแอป LLM!` |
| `"ตอบด้วยชื่อวันแรกของสัปดาห์ทำงานเป็นภาษาไทยหนึ่งคำ"` | `วันจันทร์` |

ลองเปลี่ยนคำถามหรือพิมพ์ `data` ทั้งก้อนใน [`playground.ts`](./playground.ts) ด้วย `pnpm play 0-01` คำขอใน playground ต้องใช้การตั้งค่าเดียวกัน

## 5. เฉลยและบทถัดไป

ดู [เฉลย `callLLM.ts`](./solution/callLLM.ts) แล้วไปที่ [บท 0-02](../02-errors/README.md) เพื่ออ่านสถานะเมื่อคำขอมีปัญหา
