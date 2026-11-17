import { todo } from "@src/todo";

// ฟังก์ชันทักทาย: รับชื่อ แล้วคืนข้อความทักทาย
export function greet(name: string): string {
  // 👉 ข้อ 1: คืนข้อความ "สวัสดี " ตามด้วยชื่อ
  // แนวทาง: ใช้ template string  `สวัสดี ${name}`
  return todo(1);
}
