import { getLLM } from "@src/llm";
import { buildAskGraph } from "./askGraph";

// รันกับ LLM จริง: pnpm lesson 12
const graph = buildAskGraph(getLLM());
const result = await graph.invoke({ question: "LangGraph ใช้ทำอะไร ตอบสั้น ๆ หนึ่งประโยค" });
console.log(result.answer);
