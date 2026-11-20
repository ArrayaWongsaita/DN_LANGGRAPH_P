import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { check } from "@src/check";
import { describeProvider, getLLM } from "@src/llm";
import { env } from "../01-env-schema/env";
import { todo } from "@src/todo";

// สร้างตัวเรียกจาก LLM_PROVIDER และ API key ใน .env
// บทอื่นใช้ตัวเรียกเดียวกันผ่าน import { llm }
// 👉 ข้อ 1 เรียก getLLM โดยส่ง model จาก env.LLM_MODEL หรือ undefined เพื่อใช้ค่าเริ่มต้น
export const llm: BaseChatModel = todo(1);

// ส่วนตรวจคำตอบ ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
if (import.meta.filename === process.argv[1]) {
  const { model } = describeProvider();
  const configuredModel = llm.getLsParams({}).ls_model_name;
  console.log("โมเดล", configuredModel);
  check(
    "สร้าง chat model ตามชื่อที่ตั้งไว้",
    llm instanceof BaseChatModel && configuredModel?.replace(/^models\//, "") === model.replace(/^models\//, ""),
    "ใช้ getLLM กับค่าจาก .env",
  );
}
