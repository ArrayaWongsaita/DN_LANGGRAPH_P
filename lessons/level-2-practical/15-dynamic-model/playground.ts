// Playground ของบท 2-15: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-15   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-15 --watch)
// เริ่มใหม่: pnpm play 2-15 --reset
//
// ลองทำดู:
//   1) ลองคำถาม อากาศ และ a ซ้ำ 31 ตัว
//   2) ตั้งเกณฑ์ความยาวใหม่แล้วดูโมเดลที่เลือก
//   3) เทียบชื่อ tool ที่ส่งให้แต่ละโมเดล

import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";

// เขียนโค้ดของคุณตรงนี้
