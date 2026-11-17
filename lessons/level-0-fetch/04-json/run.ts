import { describeProvider } from "@src/llm";
import { extractPerson } from "./parsePerson";

// รันกับ LLM จริง: pnpm lesson 0-04
const { model, chatUrl, apiKey } = describeProvider();

const person = await extractPerson({
  fetchFn: fetch,
  url: chatUrl,
  apiKey,
  model,
  text: "คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่",
});
console.log(person);
