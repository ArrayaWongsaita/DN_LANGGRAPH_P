import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 10  (ไม่ใช้ LLM)
// State = "กระดานกลาง" ที่ทุก node ใน graph อ่าน/เขียนร่วมกัน
// แต่ละ field ประกาศชนิดข้อมูลด้วย zod  และ .default(...) คือค่าเริ่มต้นเมื่อผู้เรียกไม่ได้ส่งมา
const ProfileState = new StateSchema({
  name: z.string(),
  // 👉 ข้อ 1: เปลี่ยน todo(1) เป็น field "age" ชนิดตัวเลข ค่าเริ่มต้น 0
  // แนวทาง: z.number().default(0)
  age: todo(1),
  // 👉 ข้อ 2: เปลี่ยน todo(2) เป็น field "city" ชนิดข้อความ ค่าเริ่มต้น "" (สตริงว่าง)
  // แนวทาง: z.string().default("")
  city: todo(2),
});

// graph เล็ก ๆ ที่มี node เดียว ไว้ดูว่า state หน้าตาเป็นอย่างไร (ให้มาแล้ว ไม่ต้องแก้)
const graph = new StateGraph(ProfileState)
  .addNode("show", (state) => ({ name: state.name }))
  .addEdge(START, "show")
  .addEdge("show", END)
  .compile();

const onlyName = await graph.invoke({ name: "มาลี" });
const everything = await graph.invoke({ name: "สมชาย", age: 30, city: "เชียงใหม่" });
console.log("ส่งแค่ name:  ", onlyName);
console.log("ส่งครบทุกช่อง:", everything);

let rejected = false;
try {
  await graph.invoke({ name: "มาลี", age: "สามสิบ" } as never);
} catch {
  rejected = true;
}

check("field ที่ไม่ได้ส่งมาได้ค่าเริ่มต้น (age = 0, city = ว่าง)", onlyName.age === 0 && onlyName.city === "", "ใส่ .default(...) ให้ age และ city");
check("field ที่ส่งมาถูกใช้แทนค่าเริ่มต้น", everything.age === 30 && everything.city === "เชียงใหม่");
check("ส่งชนิดข้อมูลผิด (age เป็นข้อความ) แล้ว error", rejected, "age ต้องเป็น z.number()");
