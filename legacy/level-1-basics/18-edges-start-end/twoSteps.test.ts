import { buildBrokenGraph, buildTwoStepGraph } from "./twoSteps";

// ================================================
// บทที่ 18: edge, START และ END
// ฝึก: ลำดับการทำงาน, compile error
// buildTwoStepGraph(log) รับ array มาเก็บชื่อ node ที่ทำงาน (เอาไว้ตรวจลำดับ)
// ตัวอย่าง:
//   const log: string[] = [];
//   await buildTwoStepGraph(log).invoke({});
//   // log คือ ["first", "second"]
// ================================================

// ------------------------------------------------
// ข้อ 1: node ต้องทำงานตามลำดับ edge: first แล้ว second
// แนวทาง: ดูค่าใน log หลัง invoke แล้ว toEqual(["first", "second"])
// ------------------------------------------------
test.todo("ทำงานตามลำดับ edge");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: state สุดท้ายต้องมาจาก node สุดท้าย { result: "second" }
// แนวทาง: toEqual(...) กับผลของ invoke
// ------------------------------------------------
test.todo("state สุดท้ายมาจาก node สุดท้าย");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: buildBrokenGraph() ลืมต่อ edge จาก START ต้อง throw error ว่า not reachable
// แนวทาง: expect(() => buildBrokenGraph()).toThrow(/not reachable/)
// ------------------------------------------------
test.todo("START ไม่ต่อไปไหนต้อง error");
// 👉 เขียน test ของข้อ 3 ตรงนี้
