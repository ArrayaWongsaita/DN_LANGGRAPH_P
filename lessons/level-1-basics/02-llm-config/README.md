# บทที่ 1-02 สร้าง chat model แล้วส่งให้บทอื่นใช้

## 1. ทำไมต้องสร้างไว้ที่เดียว

ทุกเจ้า (Groq, Google Gemini, DeepSeek, OpenCode Go) มี chat model ที่ใช้งานเหมือนกัน คือ `.invoke(...)` ต่างกันแค่ตอน **สร้าง** (ใช้คลาสไหน ใส่ key และ URL อะไร) เราจึงสร้างไว้ที่ไฟล์เดียวคือ [`llm.ts`](./llm.ts) แล้ว `export const llm` ให้บทอื่น `import { llm }` ไปใช้ จะเปลี่ยนเจ้า ก็แก้ที่ไฟล์นี้ที่เดียว

```text
บท 1-01: env.ts ──► บท 1-02: llm.ts ──► บท 1-03, 1-04, ... import { llm }
(ตรวจ .env)          (สร้าง chat model)     (เรียกใช้)
```

## 2. ลองเลือกเจ้า LLM

เปิด [`llm.ts`](./llm.ts) ในไฟล์มีตัวเลือก A, B, C, D (Groq, Google, DeepSeek, OpenCode Go) คอมเมนต์ไว้ทั้งหมด แต่ละบล็อกมี `import` ของเจ้านั้นอยู่ในบล็อก มี 1 ข้อให้ทำ (ค้นหา `// 👉 ข้อ 1`)

1. เลือกเจ้าที่คุณมี key (ตั้งไว้ใน `.env` ในบท 1-01 แล้ว)
2. **ลบ** บรรทัด `export const llm = todo(1)` ทิ้ง
3. ที่บล็อกของเจ้านั้น **เอา `//` ออก** ทั้ง `import` และ `export const llm`

`export const llm` มีได้ชื่อเดียว จึงเปิดไว้ **เจ้าเดียว** ที่เหลือคอมเมนต์ไว้ เปลี่ยนเจ้าทีหลังก็แค่สลับว่าบล็อกไหนเปิด แล้วรันจากโฟลเดอร์หลักของโปรเจกต์ (การสร้างตัวเรียกในบทนี้ยังไม่ใช้เครือข่าย)

```sh
pnpm lesson 1-02
```

ตัวอย่างบล็อกของ Groq หลังเปิดแล้ว

```ts
import { ChatGroq } from "@langchain/groq";
export const llm: BaseChatModel = new ChatGroq({
  model: env.LLM_MODEL || "openai/gpt-oss-20b",
  apiKey: env.GROQ_API_KEY,
});
```

เมื่อทำถูกจะเห็นชื่อโมเดลที่ตั้งไว้ (ผลด้านล่างเป็นของ Groq เมื่อไม่ได้ตั้ง `LLM_MODEL`)

```text
โมเดล openai/gpt-oss-20b
✅ สร้าง chat model สำเร็จและมีชื่อโมเดล
```

## 3. ตัวเลือกแต่ละเจ้า

| ตัวเลือก | คลาสที่ใช้ | ตัวแปรของ key | โมเดลเริ่มต้น (เมื่อ `LLM_MODEL` ว่าง) |
|---|---|---|---|
| A: Groq | `ChatGroq` | `GROQ_API_KEY` | `openai/gpt-oss-20b` |
| B: Google | `ChatGoogleGenerativeAI` | `GOOGLE_API_KEY` | `gemini-flash-lite-latest` |
| C: DeepSeek | `ChatOpenAI` ชี้ `baseURL` ของ DeepSeek | `DEEPSEEK_API_KEY` | `deepseek-flash` |
| D: OpenCode Go | `ChatOpenAI` ชี้ `baseURL` ของ OpenCode | `OPENCODE_GO_KEY` | `deepseek-v4.1-flash` |

DeepSeek และ OpenCode Go ใช้รูปแบบ OpenAI-compatible จึงใช้ `ChatOpenAI` แล้วเปลี่ยน `baseURL` ตัวเลือก C ปิดโหมดคิด (`thinking`) ไว้ เพราะเปิดอยู่จะใช้ tool ไม่ได้ (error 400) ส่วนตัวเลือก D ต้องมี header `x-opencode-session` ตามที่ใส่ไว้ในบล็อก

## 4. เปลี่ยนชื่อโมเดลแล้วเทียบ

ใช้เจ้าและ key ชุดเดิม รันสองรอบเทียบกัน

| `LLM_MODEL` | บรรทัดแรกที่พิมพ์ |
|---|---|
| ว่าง | ชื่อโมเดลเริ่มต้นของเจ้านั้น (ตามตารางข้างบน) |
| `demo-model` | `โมเดล demo-model` |

ตัวอย่างลองจาก terminal

    LLM_MODEL=demo-model pnpm lesson 1-02

การสร้างตัวเรียกไม่ตรวจว่าเจ้านั้นมีโมเดลชื่อนี้จริง ผ่านบทนี้จึงยังไม่ได้แปลว่าเรียกได้ ชื่อโมเดลที่ผิดและสิทธิ์ของ key จะรู้ตอนเรียกจริงในบท 1-03

## คุณทำได้แล้ว
- สร้าง chat model ของเจ้า LLM ที่เลือกเอง
- `export` ให้บทอื่น import ไปใช้

## ข้อควรจำ
- ทุกเจ้าใช้งานเหมือนกัน ต่างกันแค่ตอนสร้าง
- เปิดไว้เจ้าเดียว ที่เหลือคอมเมนต์ไว้
- ห้ามเขียน key ลงในไฟล์นี้ ให้ใช้ `env.XXX` เสมอ

ดู [เฉลย `llm.ts`](./solution/llm.ts) แล้วไป [บท 1-03 ส่งคำถามด้วย `invoke`](../03-first-llm-call/README.md)
