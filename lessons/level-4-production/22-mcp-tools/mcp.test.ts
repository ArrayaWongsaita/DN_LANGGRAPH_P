import { fakeToolLLM } from "@src/fakeToolLLM";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { askWithMcp } from "./mcp";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) เปิด MCP server จำลองในเครื่องจริง ๆ (ใช้เวลาสักครู่)
vi.setConfig({ testTimeout: 30000 });

const callAdd = { toolCalls: [{ name: "calc_add", args: { a: 2, b: 3 }, id: "m1" }] };

test("ดึง tool จากเซิร์ฟเวอร์ MCP: ชื่อมีคำนำหน้าเป็นชื่อเซิร์ฟเวอร์", async () => {
  const r = await askWithMcp(fakeToolLLM(["ok"]), "ทักทาย");
  expect(r.toolNames).toEqual(["calc_add"]);
});

test("agent เรียก tool ของ MCP ได้จริง: ผลบวกถูกส่งกลับให้โมเดล", async () => {
  const llm = fakeToolLLM([callAdd, "ผลคือ 5"]);
  const r = await askWithMcp(llm, "2+3");
  expect(r.answer).toBe("ผลคือ 5");
  expect(llm.calls[1].some((m) => m.type === "tool" && m.text.includes("5"))).toBe(true);
});

test("เรียกซ้ำสองรอบติดกันได้ (client ปิดและเปิดใหม่ได้ ไม่ค้าง)", async () => {
  await askWithMcp(fakeToolLLM(["a"]), "x");
  const r = await askWithMcp(fakeToolLLM(["b"]), "y");
  expect(r.answer).toBe("b");
});

test("ปิด client ทุกครั้งที่ใช้เสร็จ", async () => {
  const spy = vi.spyOn(MultiServerMCPClient.prototype, "close");
  await askWithMcp(fakeToolLLM(["ok"]), "x");
  expect(spy).toHaveBeenCalledTimes(1);
  spy.mockRestore();
});
