import { getLLM } from "../../../../../src/llm";

// ใช้ใน test ของ run-lesson: ไม่มี key ต้องได้ข้อความไทยที่อ่านรู้เรื่อง
await getLLM().invoke("hi");
