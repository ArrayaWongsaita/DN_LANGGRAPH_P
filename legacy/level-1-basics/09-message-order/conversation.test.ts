import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { buildConversation } from "./conversation";

// ================================================
// บทที่ 09: ลำดับของข้อความ
// ฝึก: HumanMessage, AIMessage, toBeInstanceOf
// ตัวอย่าง:
//   const msgs = buildConversation([{ role: "user", text: "ถาม" }]);
//   expect(msgs[0]).toBeInstanceOf(HumanMessage);
// ================================================

// ------------------------------------------------
// ข้อ 1: role user ต้องกลายเป็น HumanMessage และ assistant เป็น AIMessage
// แนวทาง: toBeInstanceOf(HumanMessage) / toBeInstanceOf(AIMessage)
// ------------------------------------------------
test.todo("แปลง role เป็นชนิด message");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: ต้องรักษาลำดับและข้อความเดิม
// แนวทาง: msgs.map((m) => m.content) แล้ว toEqual([...])
// ------------------------------------------------
test.todo("รักษาลำดับและข้อความ");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: array ว่างต้องได้ array ว่าง
// แนวทาง: toEqual([])
// ------------------------------------------------
test.todo("array ว่างได้ array ว่าง");
// 👉 เขียน test ของข้อ 3 ตรงนี้
