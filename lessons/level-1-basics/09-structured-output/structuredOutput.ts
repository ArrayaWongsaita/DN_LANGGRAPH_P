import type { Runnable } from "@langchain/core/runnables";
import { z } from "zod";
import { check } from "@src/check";
import { llm } from "../02-llm-config/llm";
import { todo } from "@src/todo";

// ต้องใช้โมเดลที่ตั้งไว้ในบท 1-02 และรองรับ function calling
const personSchema = z.object({ name: z.string(), age: z.number() });
// 👉 ข้อ 1 ใช้ llm.withStructuredOutput กับ personSchema และ method เป็น "functionCalling"
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const structured = llm.withStructuredOutput(personSchema, { method: "functionCalling" });
const structured: Runnable<string, z.infer<typeof personSchema>> = todo(1);

const text = "คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่";
const person = await structured.invoke(`ดึงชื่อและอายุจากข้อความนี้ ${text}`);
console.log(person);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ชื่อสมชายและอายุเป็นตัวเลข 42", person.name.includes("สมชาย") && person.age === 42, "ส่งข้อความผ่านตัวเรียกที่สร้างจาก personSchema");
