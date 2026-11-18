import { createHash, timingSafeEqual } from "node:crypto";
import { todo } from "@src/todo";

// แยก token จากหัว Authorization: "Bearer abc" → "abc"
export function parseBearer(header: string | null | undefined): string | null {
  // 👉 ข้อ 1: ต้องเป็น "<scheme> <token>" สองส่วนพอดี (แยกด้วยช่องว่าง, trim ก่อน) scheme เทียบแบบไม่สนตัวพิมพ์ต้องเป็น "bearer"
  //          และ token ไม่ว่าง ไม่งั้นคืน null (ไม่มีหัว, "Basic x", "Bearer", "Bearer a b" → null)
  return todo(1);
}

// เทียบสตริงแบบ constant-time
export function safeEqual(a: string, b: string): boolean {
  // 👉 ข้อ 2: ทำ sha256 ของทั้งสองสตริงก่อน (ให้ความยาวเท่ากัน timingSafeEqual ต้องการความยาวเท่า) แล้วเทียบด้วย timingSafeEqual
  return todo(2);
}

export type AuthResult = { ok: true; client: string } | { ok: false; reason: string };

// tokens: ชื่อผู้เรียก → token
export function authenticate(header: string | null | undefined, tokens: Record<string, string>): AuthResult {
  // 👉 ข้อ 3: token = parseBearer(header) ไม่มี → { ok: false, reason: "ไม่มี Bearer token" }
  //          วนทุกคู่ใน tokens (ไม่หยุดทันทีที่เจอ เพื่อเวลาไม่บอกตำแหน่ง) ถ้า safeEqual ตรงตัวใดให้จำชื่อ แล้วคืน { ok: true, client: ชื่อ }
  //          ไม่ตรงเลย → { ok: false, reason: "token ไม่ถูกต้อง" } (ข้อความต้องไม่มี token ที่ส่งมา)
  return todo(3);
}

export function unauthorizedResponse(reason: string): Response {
  // 👉 ข้อ 4: คืน Response สถานะ 401 หัว "WWW-Authenticate": 'Bearer realm="mcp"' และ "content-type": "application/json"
  //          body JSON { error: "unauthorized", reason }
  return todo(4);
}
