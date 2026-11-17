// โหลดก่อน run.ts ของทุกบท: ถ้าเกิด error ให้พิมพ์ข้อความสั้น ๆ ที่อ่านรู้เรื่อง ไม่พ่น stack trace
function friendly(e: unknown): never {
  const message = e instanceof Error ? e.message : String(e);
  console.error(`\n❌ ${message}\n(ดูวิธีแก้ใน README หรือบทที่ 06)`);
  process.exit(1);
}

process.on("uncaughtException", friendly);
process.on("unhandledRejection", friendly);
