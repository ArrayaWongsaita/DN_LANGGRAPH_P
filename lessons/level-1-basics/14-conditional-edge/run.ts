import { buildRouteGraph } from "./route";

// รัน: pnpm lesson 14  (ไม่ใช้ LLM จึงไม่ต้องมี API key)
const graph = buildRouteGraph();
for (const question of ["สวัสดี", "ช่วยอธิบายเรื่อง LangGraph ให้หน่อย", "ก".repeat(20)]) {
  const result = await graph.invoke({ question });
  console.log(`"${question}" (${question.length} ตัวอักษร) -> ${result.path}`);
}
