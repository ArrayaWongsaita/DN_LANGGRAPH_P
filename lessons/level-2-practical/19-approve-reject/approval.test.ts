import { buildApprovalGraph, decide, pendingQuestion, submit } from "./approval";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("pendingQuestion อ่านคำถามที่ค้างอยู่ได้", async () => {
  const graph = buildApprovalGraph();
  await submit(graph, "t", "โอนเงิน");
  expect(await pendingQuestion(graph, "t")).toBe('อนุมัติ "โอนเงิน" ไหม');
});

test("อนุมัติ: ไปทำจริง", async () => {
  const graph = buildApprovalGraph();
  await submit(graph, "t", "โอนเงิน");
  expect(await decide(graph, "t", true)).toBe("ทำแล้ว: โอนเงิน");
});

test("ปฏิเสธ: ไปเส้นทางยกเลิก", async () => {
  const graph = buildApprovalGraph();
  await submit(graph, "t", "โอนเงิน");
  expect(await decide(graph, "t", false)).toBe("ยกเลิก: โอนเงิน");
});

test("จบงานแล้วไม่มีคำถามค้าง", async () => {
  const graph = buildApprovalGraph();
  await submit(graph, "t", "โอนเงิน");
  await decide(graph, "t", true);
  expect(await pendingQuestion(graph, "t")).toBeUndefined();
});
