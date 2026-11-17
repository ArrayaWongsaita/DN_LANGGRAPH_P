import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getLLM } from "@src/llm";
import { askWithHistory } from "./askWithHistory";

// รันกับ LLM จริง: pnpm lesson 05
const llm = getLLM();
const history = [new HumanMessage("ฉันชื่อมาลี ชอบแมว"), new AIMessage("ยินดีที่ได้รู้จักค่ะคุณมาลี")];

console.log("มีประวัติ:  ", await askWithHistory(llm, "ตอบสั้น ๆ เป็นภาษาไทย", history, "ฉันชื่ออะไร และชอบอะไร"));
console.log("ไม่มีประวัติ:", await askWithHistory(llm, "ตอบสั้น ๆ เป็นภาษาไทย", [], "ฉันชื่ออะไร และชอบอะไร"));
