import { buildStreamDemo, collectUpdates } from "./streamDemo";

// ================================================
// บทที่ 25: stream: values และ updates
// ฝึก: for await, streamMode
// ตัวอย่าง:
//   await collectUpdates(buildStreamDemo(), {})
//   // [{ node: "first", update: {...} }, { node: "second", update: {...} }]
// อ่าน values เอง:
//   for await (const v of await graph.stream({}, { streamMode: "values" })) { ... }
// ================================================

// ------------------------------------------------
// ข้อ 1: ชื่อ node ใน update ต้องเรียงตามลำดับการทำงาน ["first", "second"]
// แนวทาง: updates.map((u) => u.node)
// ------------------------------------------------
test.todo("update เรียงตามลำดับ node");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: จำนวน update ต้องเท่ากับจำนวน node (2)
// แนวทาง: toHaveLength(2)
// ------------------------------------------------
test.todo("จำนวน update เท่ากับจำนวน node");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: chunk สุดท้ายของ streamMode "values" ต้องเท่ากับผลของ invoke
// แนวทาง: เก็บ chunk ทั้งหมดใน array แล้วเทียบตัวสุดท้ายกับ await graph.invoke({})
// ------------------------------------------------
test.todo("values ตัวสุดท้ายเท่ากับ invoke");
// 👉 เขียน test ของข้อ 3 ตรงนี้
