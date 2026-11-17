import { AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { executeCalls, makeToolNode } from "./toolNode";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const tools = [makeAddTool(), makeWeatherTool()];
const call = (name: string, args: Record<string, unknown>, id: string) => ({
  name,
  args,
  id,
  type: "tool_call" as const,
});

test("makeToolNode คืน ToolNode", () => {
  expect(makeToolNode(tools)).toBeInstanceOf(ToolNode);
});

test("รัน tool call เดียว ได้ ToolMessage ที่มีผลและ tool_call_id ตรงกัน", async () => {
  const ai = new AIMessage({ content: "", tool_calls: [call("add", { a: 2, b: 3 }, "c1")] });
  const out = await executeCalls(tools, ai);
  expect(out).toHaveLength(1);
  expect(out[0].content).toBe("5");
  expect(out[0].tool_call_id).toBe("c1");
});

test("หลาย tool call ในข้อความเดียว: ได้ผลครบ จับคู่ id ถูก", async () => {
  const ai = new AIMessage({
    content: "",
    tool_calls: [call("add", { a: 1, b: 1 }, "x"), call("getWeather", { city: "เชียงใหม่" }, "y")],
  });
  const out = await executeCalls(tools, ai);
  const byId = Object.fromEntries(out.map((m) => [m.tool_call_id, m.content]));
  expect(byId).toEqual({ x: "2", y: "อากาศเย็น 22 องศา" });
});
