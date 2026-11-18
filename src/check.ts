/**
 * ตัวช่วยของบทแบบไฟล์เดียว: พิมพ์ผลตรวจหนึ่งข้อ
 * ผ่าน = ✅  ไม่ผ่าน = ❌ พร้อมคำใบ้ และตั้ง exit code เป็น 1
 */
export function check(label: string, ok: boolean, hint = ""): boolean {
  console.log(`${ok ? "✅" : "❌"} ${label}${!ok && hint ? `  (${hint})` : ""}`);
  if (!ok) process.exitCode = 1;
  return ok;
}
