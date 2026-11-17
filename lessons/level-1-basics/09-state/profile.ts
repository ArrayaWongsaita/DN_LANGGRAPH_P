import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

// State = "กระดานกลาง" ที่ทุก node ใน graph อ่าน/เขียนร่วมกัน
// แต่ละ field ประกาศชนิดข้อมูลด้วย zod  และ .default(...) คือค่าเริ่มต้นเมื่อผู้เรียกไม่ได้ส่งมา
export const ProfileState = new StateSchema({
  name: z.string(),
  // 👉 ข้อ 1: เปลี่ยน todo(1) เป็น field "age" ชนิดตัวเลข ค่าเริ่มต้น 0
  // แนวทาง: z.number().default(0)
  age: todo(1),
  // 👉 ข้อ 2: เปลี่ยน todo(2) เป็น field "city" ชนิดข้อความ ค่าเริ่มต้น "" (สตริงว่าง)
  // แนวทาง: z.string().default("")
  city: todo(2),
});

// graph เล็ก ๆ ที่มี node เดียว ไว้ดูว่า state หน้าตาเป็นอย่างไร (ให้มาแล้ว ไม่ต้องแก้)
export function buildProfileGraph() {
  return new StateGraph(ProfileState)
    .addNode("show", (state) => ({ name: state.name }))
    .addEdge(START, "show")
    .addEdge("show", END)
    .compile();
}
