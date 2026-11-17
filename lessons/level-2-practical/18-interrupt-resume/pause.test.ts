import { answer, buildPauseGraph, start } from "./pause";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("เริ่มงานแล้ว graph หยุดรออนุมัติ (ยังไม่ทำ)", async () => {
  const graph = buildPauseGraph();
  expect(await start(graph, "t", "ลบไฟล์")).toBe(true);
  const state = await graph.getState({ configurable: { thread_id: "t" } });
  expect(state.next).toEqual(["ask"]);
  expect(state.values.result).toBe("");
});

test("ข้อมูลที่ interrupt ส่งออกมา มีคำถามและ action", async () => {
  const graph = buildPauseGraph();
  await start(graph, "t", "ลบไฟล์");
  const state = await graph.getState({ configurable: { thread_id: "t" } });
  expect(state.tasks[0].interrupts[0].value).toEqual({ question: "อนุมัติไหม?", action: "ลบไฟล์" });
});

test("resume ด้วย yes: ทำต่อจนเสร็จ", async () => {
  const graph = buildPauseGraph();
  await start(graph, "t", "ลบไฟล์");
  expect(await answer(graph, "t", "yes")).toBe("ทำแล้ว: ลบไฟล์");
});

test("resume ด้วยคำอื่น: ยกเลิก", async () => {
  const graph = buildPauseGraph();
  await start(graph, "t", "ลบไฟล์");
  expect(await answer(graph, "t", "no")).toBe("ยกเลิก: ลบไฟล์");
});

test("หลาย thread หยุดค้างพร้อมกันได้ แยกกัน", async () => {
  const graph = buildPauseGraph();
  await start(graph, "a", "งาน A");
  await start(graph, "b", "งาน B");
  expect(await answer(graph, "b", "yes")).toBe("ทำแล้ว: งาน B");
  expect(await answer(graph, "a", "no")).toBe("ยกเลิก: งาน A");
});
