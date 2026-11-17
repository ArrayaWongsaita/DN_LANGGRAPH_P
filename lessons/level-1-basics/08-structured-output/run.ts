import { getLLM } from "@src/llm";
import { extractPerson } from "./extractPerson";

// รันกับ LLM จริง: npm run lesson 08
// temperature 0 = ให้ตอบนิ่ง ๆ เหมาะกับงานดึงข้อมูล
const person = await extractPerson(getLLM({ temperature: 0 }), "คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่");
console.log(person);
console.log(`ชื่อ: ${person.name}, อายุ: ${person.age}`);
