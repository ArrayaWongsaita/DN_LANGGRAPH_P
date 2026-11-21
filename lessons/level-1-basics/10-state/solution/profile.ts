import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const ProfileState = new StateSchema({
  name: z.string(),
  age: z.number().default(0),
  city: z.string().default(""),
});

const app = new StateGraph(ProfileState)
  .addNode("show", (state) => ({ name: state.name }))
  .addEdge(START, "show")
  .addEdge("show", END)
  .compile();

const onlyName = await app.invoke({ name: "มาลี" });
const withDetails = await app.invoke({ name: "มาลี", age: 30, city: "เชียงใหม่" });
console.log(onlyName);
console.log(withDetails);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
let rejected = false;
try {
  await app.invoke({ name: "มาลี", age: "สามสิบ" } as never);
} catch {
  rejected = true;
}

check("เมื่อส่งแค่ชื่อ age เป็น 0 และ city เป็นสตริงว่าง", onlyName.age === 0 && onlyName.city === "", "ใส่ค่าเริ่มต้นให้ age");
check("เมื่อส่งอายุและเมือง graph ใช้ค่าที่ส่งมา", withDetails.age === 30 && withDetails.city === "เชียงใหม่");
check("graph ปฏิเสธ age ที่เป็นข้อความ", rejected, "กำหนด age เป็น z.number()");
