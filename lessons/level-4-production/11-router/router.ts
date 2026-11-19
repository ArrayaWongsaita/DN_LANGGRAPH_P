import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-11
// router (หลายแหล่ง): LLM เลือกว่าคำถามเกี่ยวกับแหล่งความรู้ใดบ้าง ถามทุกแหล่งพร้อมกัน (Send) แล้วรวมคำตอบ
const SOURCES = ["hr", "it", "general"] as const;

const State = new StateSchema({
  question: z.string().default(""),
  sources: z.array(z.string()).default(() => []),
  answers: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
  final: z.string().default(""),
});

function buildRouter(model: BaseChatModel) {
  return new StateGraph(State)
    .addNode("classify", async (state) => {
      const pick = await model
        .withStructuredOutput(z.object({ sources: z.array(z.enum(SOURCES)) }), { method: "functionCalling" })
        .invoke(`เลือกแหล่งความรู้ที่เกี่ยวกับคำถามนี้ (hr/it/general): ${state.question}`);
      return { sources: pick.sources };
    })
    .addNode("ask", async (input: unknown) => {
      const { source, question } = input as { source: string; question: string };
      return { answers: `[${source}] ${(await model.invoke(`ตอบจากแหล่ง ${source}: ${question}`)).text}` };
    })
    .addNode("synthesize", async (state) => {
      // 👉 ข้อ 2: prompt = `คำถาม: ${state.question}\nคำตอบจากแต่ละแหล่ง:\n${state.answers.join("\n")}\nรวมเป็นคำตอบเดียว`
      //          คืน { final: (await model.invoke(prompt)).text }
      return todo(2);
    })
    .addEdge(START, "classify")
    .addConditionalEdges(
      "classify",
      (state) => {
        // 👉 ข้อ 1: คืนรายการ new Send("ask", { source, question: state.question }) หนึ่งอันต่อหนึ่งแหล่งใน state.sources
        //          ถ้า state.sources ว่าง ให้ใช้ ["general"] เป็นทางสำรอง
        return todo(1);
      },
      ["ask"],
    )
    .addEdge("ask", "synthesize")
    .addEdge("synthesize", END)
    .compile();
}

// ส่วนที่ 1: โมเดลปลอม (สคริปต์: classify แล้ว คำตอบของแต่ละแหล่ง แล้ว รวมคำตอบ) ตรวจทางแตกกิ่งแน่นอนทุกครั้ง
const pick = (sources: string[]) => JSON.stringify({ sources });
const twoModel = fakeToolLLM([pick(["hr", "it"]), "ตอบ hr", "ตอบ it", "รวมแล้ว"]);
const two = await buildRouter(twoModel).invoke({ question: "ลาป่วยแล้วขอ VPN ได้ไหม" });
const oneModel = fakeToolLLM([pick(["it"]), "ตอบ it", "รวม"]);
const one = await buildRouter(oneModel).invoke({ question: "q" });
const noneModel = fakeToolLLM([pick([]), "ตอบทั่วไป", "รวม"]);
const none = await buildRouter(noneModel).invoke({ question: "q" });
const synthPrompt = twoModel.calls[3]?.[0]?.text ?? "";

// ส่วนที่ 2: โมเดลจริง: คำถามที่เกี่ยวกับสองแหล่ง
const real = await buildRouter(llm).invoke({ question: "ฉันลาป่วยได้กี่วัน และขอสิทธิ์ใช้ VPN ทำงานที่บ้านต้องทำอย่างไร" });
console.log({ sources: real.sources, final: real.final.slice(0, 100) });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("สองแหล่ง: ถามทั้งสองและเก็บคำตอบครบ", JSON.stringify([...two.answers].sort()) === JSON.stringify(["[hr] ตอบ hr", "[it] ตอบ it"]) && two.final === "รวมแล้ว", "ส่ง Send หนึ่งอันต่อหนึ่งแหล่ง");
check("ขั้นรวมเห็นคำตอบของทุกแหล่ง", synthPrompt.includes("[hr]") && synthPrompt.includes("[it]"));
check("แหล่งเดียว: ถามแค่แหล่งนั้น (เรียกโมเดล 3 ครั้ง)", JSON.stringify(one.answers) === JSON.stringify(["[it] ตอบ it"]) && oneModel.calls.length === 3);
check("classify ไม่เลือกแหล่งไหน: ใช้ general เป็นทางสำรอง ไม่ล่ม", JSON.stringify(none.answers) === JSON.stringify(["[general] ตอบทั่วไป"]) && none.final === "รวม", "ถ้า state.sources ว่างใช้ [\"general\"]");
check("โมเดลจริง: เลือกอย่างน้อยหนึ่งแหล่ง ได้คำตอบรวม", real.sources.length >= 1 && real.answers.length === real.sources.length && real.final.length > 0);
