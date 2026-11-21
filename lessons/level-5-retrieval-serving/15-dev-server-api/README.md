# บทที่ 5-15 รันเซิร์ฟเวอร์ `langgraph dev` และเรียก API ตรง ๆ

## แนวคิด

บท 4-25 สอนไฟล์ `langgraph.json` บทนี้ **รันเซิร์ฟเวอร์จริง** และเรียก REST API ของมันด้วย `fetch` ก่อนจะใช้ SDK ในบทถัดไป เพื่อให้เข้าใจว่า SDK ห่ออะไรไว้

```bash
langgraphjs dev --no-browser --port 2024 --config <path>/langgraph.json
```
- ไม่ต้องมีบัญชี LangSmith (เฉพาะหน้าเว็บ Studio ที่ต้องมี) เป็นเซิร์ฟเวอร์ **ในหน่วยความจำ** สำหรับพัฒนา: รีสตาร์ทแล้วข้อมูล thread หาย (ของจริงใช้ deployment ที่มี Postgres)
- เซิร์ฟเวอร์ให้ checkpointer และ store เอง จึง **ไม่ต้อง** ใส่ `checkpointer` ตอน `compile()` ในไฟล์ graph ที่จะเสิร์ฟ
- ชื่อ graph ใน `langgraph.json` (`"demo"`) ใช้เป็น `assistant_id` ได้เลย

API หลักที่บทนี้เรียก (รูปแบบที่สังเกตจากการรันจริง):

| ทำอะไร | เรียก | ได้อะไร |
|---|---|---|
| สร้าง thread | `POST /threads` | `{ thread_id, ... }` |
| รันแล้วรอผล | `POST /threads/{id}/runs/wait` body `{ assistant_id, input }` | state สุดท้ายเป็น JSON |
| รันแบบสตรีม | `POST /threads/{id}/runs/stream` body เพิ่ม `stream_mode` | SSE: `metadata`, `values`/`updates`, ..., `end` |
| อ่าน state | `GET /threads/{id}/state` | `{ values, next, ... }` |

รูปแบบข้อความ SSE ที่เซิร์ฟเวอร์ส่ง (ต่างจากบท 5-09 ที่คุณเป็นฝั่งส่ง ตอนนี้เป็นฝั่ง **อ่าน**):

    event: values
    data: {"question":"..."}
    id: 1
    (บรรทัดว่าง)

ความท้าทายของฝั่งอ่าน: ข้อมูลมาเป็น **ก้อน (chunk) ที่ตัดตรงไหนก็ได้** อาจขาดกลางบรรทัด หรือแม้แต่ **กลางตัวอักษรไทยหนึ่งตัว** (หนึ่งตัวอักษรหลายไบต์) ต้องรวมให้ครบก่อนแปลงเป็นข้อความ

## 1. ลองเติมช่องเดียว

เปิด [`api.ts`](./api.ts) แล้วเติมข้อ 1: เติมส่วนหลักของบท (รันเซิร์ฟเวอร์ `langgraph dev` และเรียก API ตรง ๆ) รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้เปิดเซิร์ฟเวอร์ `langgraph dev` ชั่วคราวเอง (ต้องติดตั้งตามที่ README เดิมของ Level 4-5 อธิบายไว้) บทนี้ไม่เรียกโมเดลจริง

```sh
pnpm lesson 5-15
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

โฟลเดอร์ `server/` มี graph ตัวอย่าง (ไม่ใช้โมเดล) กับ `langgraph.json` ให้แล้ว `api.ts` ส่วนอื่นของบทนี้เขียนไว้ให้แล้ว ขาดแค่ข้อ 1

โค้ดตามแนวทาง:

```ts
const res = await ensureOk(
  await fetchFn(endpoint(base, `/threads/${threadId}/runs/wait`), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ assistant_id: assistantId, input }) }),
);
return res.json();
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
กำลังเปิดเซิร์ฟเวอร์ (ครั้งแรกอาจใช้เวลาสักครู่)...
  thread: '01a1f97c-6269-75c5-ba3c-3b1101b05243',
  first: { question: 'สวัสดี', answer: 'ตอบ: สวัสดี', turns: 1 },
  second: { question: 'อีกครั้ง', answer: 'ตอบ: อีกครั้ง', turns: 2 },
  values: { question: 'อีกครั้ง', answer: 'ตอบ: อีกครั้ง', turns: 2 },
  streamed: 4,
  badAssistant: 'เซิร์ฟเวอร์ตอบ 404: No assistant found for "ไม่มีจริง". Make sure the assistant ID is for a valid assistant or a valid graph ID.'
✅ ensureOk: ผ่านเมื่อ ok และโยน error ที่มีสถานะ+ข้อความเมื่อไม่ ok
✅ createThread: POST /threads (base มี / ท้ายก็ไม่ซ้อน) คืน thread_id
✅ runWait: ส่ง assistant_id + input ไปที่ /threads/{id}/runs/wait และคืนผล
✅ runWait: เซิร์ฟเวอร์ตอบ 404 → error อ่านรู้เรื่อง
✅ getState: อ่าน state (ให้ไว้แล้ว ใช้ ensureOk ของคุณ)
✅ parseSse: event/data/id ปกติ
✅ parseSse: ก้อนถูกตัดกลางบรรทัด กลางคำ และกลางตัวคั่น ก็ได้ผลเหมือนเดิม
✅ parseSse: data หลายบรรทัด, 
, คอมเมนต์ และไม่มี event (= message)
✅ parseSse: เหตุการณ์สุดท้ายที่ไม่มีบรรทัดว่างปิดท้ายยังถูกส่งออก และบล็อกว่างถูกข้าม
✅ streamRun: ส่ง stream_mode ถูก yield ทุกเหตุการณ์ (ยกเว้น end) และหยุดที่ end
✅ streamRun: ไบต์ตัวอักษรไทยถูกตัดครึ่งระหว่างก้อน ต้องไม่เพี้ยน (TextDecoder แบบ stream)
✅ streamRun: เหตุการณ์ error ทำให้ throw ด้วยข้อความจากเซิร์ฟเวอร์
✅ streamRun: เซิร์ฟเวอร์ตอบ 404 ก่อนเริ่มสตรีม → error อ่านรู้เรื่อง
✅ เซิร์ฟเวอร์จริง: รอบ 1 และ 2 ตอบถูก และ turns เพิ่มเพราะ state ค้างใน thread
✅ เซิร์ฟเวอร์จริง: สตรีมได้เหตุการณ์ values ที่มีคำตอบ และไม่มี end หลุดมา
✅ เซิร์ฟเวอร์จริง: assistant ที่ไม่มีได้ error ที่อ่านรู้เรื่อง
```

สิ่งที่ได้: เรียก LangGraph server ได้ด้วย HTTP ล้วน ๆ รวมถึงอ่านสตรีม SSE ที่ถูกตัดเป็นก้อนอย่างถูกต้อง

## ข้อควรจำ

- `/docs` ของเซิร์ฟเวอร์เปิดดู OpenAPI ครบทุก endpoint ได้
- ใช้ `localhost` ไม่ใช่ `127.0.0.1`: เซิร์ฟเวอร์เปิดที่ `::1` (IPv6) ถ้าเรียก `127.0.0.1` จะต่อไม่ติด (เจอตอนรันจริง)
- ข้อผิดพลาดจากเซิร์ฟเวอร์ (เช่น 404 ไม่พบ assistant) ต้องแปลงเป็น error ที่อ่านรู้เรื่อง ไม่ใช่ปล่อย JSON พังต่อ
- ของจริงต้องมีการยืนยันตัวตนหน้าเซิร์ฟเวอร์ (บท 5-18 ว่าด้วยการยืนยันตัวตนฝั่ง MCP แนวคิดคล้ายกัน)

## ลองต่อใน playground

รัน `pnpm play 5-15` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `api.ts`](./solution/api.ts) · ไปต่อ [บท 5-16 เรียกเซิร์ฟเวอร์ด้วย JS SDK](../16-js-sdk/README.md)
