import { END, START, StateGraph } from "@langchain/langgraph";
import { ChatState } from "./state";

// ================================================
// บทที่ 16: State (กระดานกลางของ graph)
// ฝึก: StateSchema, ค่าเริ่มต้น, ตรวจชนิดข้อมูล
// ตัวอย่าง graph เล็ก ๆ ที่ใช้ทดสอบ state (node แค่ส่งค่า question เดิมกลับ):
//   const graph = new StateGraph(ChatState)
//     .addNode("noop", (s) => ({ question: s.question }))
//     .addEdge(START, "noop").addEdge("noop", END).compile();
//   await graph.invoke({}) // ได้ค่าเริ่มต้นของทุก field
// ================================================

// ------------------------------------------------
// ข้อ 1: invoke({}) ต้องได้ { question: "", answer: "" }
// แนวทาง: สร้าง graph ตามตัวอย่าง แล้ว toEqual(...)
// ------------------------------------------------
test.todo("ค่าเริ่มต้นเป็นสตริงว่าง");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: invoke({ question: "ชื่ออะไร" }) ต้องเก็บค่า question ไว้ใน state
// แนวทาง: ดู result.question
// ------------------------------------------------
test.todo("ค่าที่ส่งเข้าไปถูกเก็บ");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: ส่ง question เป็นตัวเลข 5 (ผิดชนิด) ต้อง reject และข้อความ error พูดถึง question
// แนวทาง: await expect(graph.invoke({ question: 5 as unknown as string })).rejects.toThrow(/question/)
// ------------------------------------------------
test.todo("ชนิดข้อมูลผิดถูกปฏิเสธ");
// 👉 เขียน test ของข้อ 3 ตรงนี้
