import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { RemoveMessage, SystemMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  messages: MessagesValue,
  summary: z.string().default(""),
});

const MAX_MESSAGES = 4; // ยาวกว่านี้ให้สรุป
const KEEP_LAST = 2; // เก็บข้อความล่าสุดไว้กี่ข้อความหลังสรุป

export function buildSummarizingChat(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("chat", async (state) => {
      const head = state.summary ? [new SystemMessage(`สรุปบทสนทนาก่อนหน้า: ${state.summary}`)] : [];
      return { messages: [await llm.invoke([...head, ...state.messages])] };
    })
    .addNode("summarize", async (state) => {
      // 👉 ข้อ 2: ขอให้ llm สรุปบทสนทนาใน state.messages แล้วเก็บ .text ไว้ในตัวแปร summaryText
      //          แนวทาง: const reply = await llm.invoke([...state.messages, new HumanMessage("สรุปบทสนทนาข้างต้นสั้น ๆ")]);
      const summaryText: string = todo(2);
      // 👉 ข้อ 3: สร้าง RemoveMessage ให้ทุกข้อความ ยกเว้น KEEP_LAST ข้อความสุดท้าย
      //          แนวทาง: state.messages.slice(0, -KEEP_LAST).map((m) => new RemoveMessage({ id: m.id! }))
      const removals: RemoveMessage[] = todo(3);
      return { summary: summaryText, messages: removals };
    })
    .addEdge(START, "chat")
    .addConditionalEdges(
      "chat",
      (state) => {
        // 👉 ข้อ 1: คืน "summarize" ถ้า state.messages ยาวกว่า MAX_MESSAGES ไม่เช่นนั้นคืน END
        return todo(1);
      },
      ["summarize", END],
    )
    .addEdge("summarize", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type SummarizingChat = ReturnType<typeof buildSummarizingChat>;

export async function chat(graph: SummarizingChat, text: string) {
  return graph.invoke({ messages: [new HumanMessage(text)] }, { configurable: { thread_id: "t" } });
}
