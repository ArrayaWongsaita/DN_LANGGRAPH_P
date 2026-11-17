# TypeScript ที่เจอในคอร์ส (อ่านเมื่อเจอแล้วงง)

- `x!` (non-null assertion): บอก TypeScript ว่า "ค่านี้ไม่เป็น undefined แน่" เช่น `runtime.store!.get(...)`, `llm.bindTools!(tools)` (บางเมธอดเป็น optional ใน type) ใช้เมื่อเรามั่นใจเท่านั้น
- `value as T` (cast): บอกชนิดที่เรารู้แต่ TypeScript อนุมานเองไม่ได้ เช่น `input as { topic: string }` ใน node ที่รับค่าจาก `Send` ไม่ได้ตรวจค่าจริงตอนรัน
- `x?.y` และ `a ?? b`: เข้าถึงอย่างปลอดภัยเมื่อ x อาจไม่มีค่า / ใช้ b เมื่อ a เป็น null หรือ undefined
- `async` / `await`: ฟังก์ชันที่รอผล (เรียก LLM, อ่านฐานข้อมูล) ต้อง `await` ก่อนใช้ผล
- `import type { ... }`: นำเข้าเฉพาะชนิด ไม่มีผลตอนรัน
