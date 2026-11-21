// รันด้วย pnpm exec tsx lessons/level-2-practical/09-bind-tools/solution/bind.ts ใช้ API key จากบท 1-02
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

const tools: StructuredToolInterface[] = [makeAddTool(), makeWeatherTool()];
const bound = llm.bindTools!(tools);

const question = "ช่วยใช้ tool add บวก 23 กับ 19";
const reply = await bound.invoke([new HumanMessage(question)]);
const call = reply.tool_calls?.[0];
if (!call) throw new Error("โมเดลไม่ได้ส่ง tool_calls กลับมา ลองระบุชื่อ tool ในคำถาม");

console.log(JSON.stringify({ name: call.name, args: call.args }));
const selected = tools.find((item) => item.name === call.name);
if (!selected) throw new Error(`ไม่มี tool ชื่อ ${call.name}`);

const result = await selected.invoke({ ...call, type: "tool_call" });
const content = ToolMessage.isInstance(result) ? result.text : result;
console.log("ผลของ tool =", content);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("โมเดลขอเรียก add", call.name === "add");
check("รัน add แล้วได้ 42", content === "42");
