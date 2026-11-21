# บทที่ 3-33 ตั้งค่า tracing (ทางเลือก)

## แนวคิด

เมื่อ agent ทำงานผิดแปลก คำถามคือ "มันคิดอะไร เรียกอะไร ตอนไหน" **tracing** บันทึกทุกขั้น (ทุก node ทุกการเรียกโมเดลและ tool) ไปที่บริการ LangSmith เพื่อเปิดดูย้อนหลัง LangChain/LangGraph ส่งข้อมูล trace **เองโดยอัตโนมัติเมื่อมี environment variable** ที่เกี่ยวข้องเท่านั้น:

```
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=...        (key ของบริการ ไม่เกี่ยวกับ key ของ LLM)
LANGSMITH_PROJECT=ชื่อโปรเจกต์
```
**เรื่องความเป็นส่วนตัว:** trace มี prompt และคำตอบทั้งหมด (อาจมีข้อมูลผู้ใช้) จึงเป็นเรื่องที่ **เปิดใช้โดยตั้งใจ** ไม่ใช่ค่าเริ่มต้น และคอร์สนี้ไม่เปิดให้ บทนี้ฝึกเขียนตัวอ่านและตรวจ config แบบ zod (สไตล์เดียวกับ `src/env.ts`) ที่บอกว่า "ตอนนี้ tracing เปิดอยู่หรือไม่" เพื่อให้แอปแสดงเตือนก่อนส่งข้อมูลออก

## 1. ลองเติมช่องเดียว

เปิด [`tracing.ts`](./tracing.ts) แล้วเติมข้อ 1: เขียนตัวตัดสินใจ `readTracing` ว่า tracing เปิดอยู่หรือไม่จากตัวแปรสภาพแวดล้อม รันจากโฟลเดอร์หลักของโปรเจกต์ บทนี้ไม่เรียกโมเดลจริง รันได้โดยไม่ต้องมี API key

```sh
pnpm lesson 3-33
```

ในไฟล์ข้อ 1 มี **แนวทาง** เป็นโค้ดที่คอมเมนต์ไว้ เอา `//` ออกแล้วแทนที่ `todo(1)` ได้เลย แต่ลองอ่านก่อนว่าแต่ละบรรทัดทำอะไร

ในไฟล์มี schema ของตัวแปรและตัวช่วย `maskKey` ให้แล้ว ขาดแค่ตัวตัดสินใจ

โค้ดตามแนวทาง:

```ts
const wanted = env.LANGSMITH_TRACING === "true";
const hasKey = Boolean(env.LANGSMITH_API_KEY);
return {
  enabled: wanted && hasKey,
  project: env.LANGSMITH_PROJECT ?? "default",
  reason: wanted ? (hasKey ? "เปิด" : "ขาด LANGSMITH_API_KEY") : "ไม่ได้เปิด",
};
```

## 2. ผลที่ได้

ผลที่รันจากเฉลย

```text
  on: { enabled: true, project: 'course', reason: 'เปิด' },
  off: { enabled: false, project: 'default', reason: 'ไม่ได้เปิด' },
  noKey: {
    enabled: false,
    project: 'default',
    reason: 'ขาด LANGSMITH_API_KEY'
  masked: 'lsv2...56'
✅ ตั้งครบ: เปิดอยู่ และใช้ชื่อโปรเจกต์ที่ตั้ง
✅ ไม่ตั้งอะไรเลย: ไม่เปิด โปรเจกต์ default
✅ เปิดแต่ไม่มี key: ไม่เปิด บอกเหตุผล
✅ maskKey ซ่อนส่วนกลางของ key
```

สิ่งที่ได้: อ่านและตรวจ config ของ tracing อย่างปลอดภัย

## 3. ส่วนประกอบที่ใช้ในบทนี้

| เงื่อนไข | `enabled` | `reason` |
|---|---|---|
| `LANGSMITH_TRACING` ไม่ใช่ `"true"` | `false` | ไม่ได้เปิด |
| เปิด แต่ไม่มี `LANGSMITH_API_KEY` | `false` | ขาด LANGSMITH_API_KEY |
| เปิดและมี key | `true` | เปิด |

## ข้อควรจำ

- ไลบรารีรุ่นเก่ากว่ายังอ่านชื่อตัวแปรเดิมอย่าง `LANGCHAIN_TRACING_V2` และ `LANGSMITH_TRACING_V2` ได้ด้วย บทนี้ดูเฉพาะชุด `LANGSMITH_*` เพื่อความเรียบง่าย ของจริงควรตรวจชื่อเก่าด้วย
- เปิด tracing เมื่อมี key เท่านั้น และรู้ว่าข้อมูลอะไรจะออกไป
- ห้ามพิมพ์ key ลง log (ใช้ตัวช่วย `maskKey` ในไฟล์)

## ลองต่อใน playground

รัน `pnpm play 3-33` เพื่อเล่นกับโค้ดของบทนี้โดยไม่มีส่วนตรวจคำตอบ (ใช้ `--watch` ให้รันซ้ำเมื่อบันทึก และ `--reset` เพื่อเริ่มใหม่)

ดู [เฉลย `tracing.ts`](./solution/tracing.ts) · ไปต่อ [บท 3-34 Capstone ตอนที่ 1 ผู้ช่วยค้นคว้า (แกนกลาง)](../34-capstone-research/README.md)
