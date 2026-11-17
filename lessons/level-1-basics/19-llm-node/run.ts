import { getLLM } from "../../../src/llm";
import { buildAnswerGraph } from "./answerNode";

// รันกับ LLM จริง: npm run lesson 19
const result = await buildAnswerGraph(getLLM()).invoke({ question: "LangGraph คืออะไร ตอบสั้น ๆ" });
console.log(result.answer);
