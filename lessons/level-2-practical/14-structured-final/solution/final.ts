// รันด้วย pnpm exec tsx lessons/level-2-practical/14-structured-final/solution/final.ts ใช้ API key จากบท 1-02
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

const AnswerSchema = z.object({ city: z.string(), tempC: z.number(), summary: z.string() });
const State = new StateSchema({ messages: MessagesValue, answer: AnswerSchema.optional() });

const graph = new StateGraph(State)
  .addNode("format", async (state) => {
    const formatter = llm.withStructuredOutput(AnswerSchema, { method: "functionCalling" });
    const input = [...state.messages, new HumanMessage("จัดคำตอบอากาศตาม schema โดยคงชื่อเมืองเดิม")];
    return { answer: await formatter.invoke(input) };
  })
  .addEdge(START, "format")
  .addEdge("format", END)
  .compile();

// ใช้ประวัติที่ agent ตอบเสร็จแล้วเป็นอินพุตของ node format
const result = await graph.invoke({
  messages: [
    new HumanMessage("อากาศที่เชียงใหม่เป็นอย่างไร"),
    new AIMessage({
      content: "",
      tool_calls: [
        { name: "getWeather", args: { city: "เชียงใหม่" }, id: "weather", type: "tool_call" },
      ],
    }),
    new ToolMessage({ content: "อากาศเย็น 22 องศา", tool_call_id: "weather", name: "getWeather" }),
    new AIMessage("เชียงใหม่อากาศเย็น 22 องศา"),
  ],
});
console.log(JSON.stringify(result.answer));

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("ได้ answer ที่ตรงกับ schema", AnswerSchema.safeParse(result.answer).success);
check("อ่านอุณหภูมิ 22 จากผล tool", result.answer?.tempC === 22);
check("ประวัติยังครบ 4 ข้อความ", result.messages.length === 4);
