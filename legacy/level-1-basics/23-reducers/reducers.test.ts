import { END, START, StateGraph } from "@langchain/langgraph";
import { CounterState, buildParallelGraph, buildSequentialGraph } from "./reducers";

// ================================================
// บทที่ 23: reducer (กติกาการรวมค่า)
// ฝึก: ReducedValue, node ขนานกัน
// CounterState มี log (ต่อท้าย array), score (บวกเลข), last (ไม่มี reducer: ทับ)
// ตัวอย่าง:
//   (await buildSequentialGraph().invoke({})).log // ["a", "b"]
// ================================================

// ------------------------------------------------
// ข้อ 1: buildSequentialGraph: log ต้องเก็บทุกค่าที่ node เขียน ได้ ["a", "b"]
// แนวทาง: toEqual(["a", "b"])
// ------------------------------------------------
test.todo("append reducer เก็บทุกค่า");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: buildParallelGraph: score ต้องเป็น 3 (1+2) และ log มี "x" กับ "y" (ลำดับไม่แน่นอน จึง sort ก่อนเทียบ)
// แนวทาง: [...result.log].sort() แล้ว toEqual(["x", "y"])
// ------------------------------------------------
test.todo("node ขนานกันค่ารวมกัน");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: สร้าง graph เอง: node "one" เขียน last เป็น "1" แล้ว node "two" เขียน last เป็น "2" ต่อกัน ผลสุดท้ายต้องเป็น "2" (field ไม่มี reducer ถูกทับ)
// แนวทาง: new StateGraph(CounterState).addNode(...).addEdge(START, "one").addEdge("one", "two").addEdge("two", END).compile()
// ------------------------------------------------
test.todo("field ไม่มี reducer ถูกทับ");
// 👉 เขียน test ของข้อ 3 ตรงนี้
