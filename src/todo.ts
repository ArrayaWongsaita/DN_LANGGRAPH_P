/** ช่องที่ผู้เรียนต้องเติม: ถ้ายังไม่ได้ทำ จะ throw ข้อความไทยบอกว่าข้อไหน */
export function todo(n: number): never {
  throw new Error(`ยังไม่ได้ทำข้อ ${n}`);
}
