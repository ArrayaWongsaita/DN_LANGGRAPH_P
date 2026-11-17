import { buildStreamDemo, collectUpdates, collectValues } from "./streamDemo";

// รัน: pnpm lesson 18  (ไม่ใช้ LLM)
const graph = buildStreamDemo();
console.log("updates:", JSON.stringify(await collectUpdates(graph, {})));
console.log("values: ", JSON.stringify(await collectValues(graph, { log: "start" })));
