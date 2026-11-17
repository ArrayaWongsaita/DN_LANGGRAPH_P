import { StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// State = "กระดานกลาง" ที่ทุก node อ่าน/เขียนร่วมกัน
// .default(...) คือค่าเริ่มต้นเมื่อผู้เรียกไม่ได้ส่งมา
export const ChatState = new StateSchema({
  question: z.string().default(""),
  answer: z.string().default(""),
});

export type ChatStateType = typeof ChatState.State;
