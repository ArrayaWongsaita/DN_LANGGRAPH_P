import { StateGraph, StateSchema, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { buildDiamond, findNameClashes, groupSupersteps, isConcurrentUpdateError, maxParallelism, recordDebug, userChannels } from "./pregel";

const graph = buildDiamond(true);
const steps = groupSupersteps(await recordDebug(graph));
console.log("รอบรัน:", steps.map((s) => `#${s.step} [${s.nodes.join(", ")}]`).join("  "));
console.log("ขนานสูงสุด:", maxParallelism(steps), "node");
console.log("channel ทั้งหมด:", Object.keys((graph as unknown as { channels: object }).channels).join(", "));
console.log("channel ของผู้ใช้:", userChannels(Object.keys((graph as unknown as { channels: object }).channels)).join(", "));

try {
  await buildDiamond(false).invoke({});
} catch (error) {
  console.log("ไม่มี reducer →", isConcurrentUpdateError(error) ? "error ความขนาน:" : "error อื่น:", (error as Error).message.split("\n")[0]);
}

const State = new StateSchema({ log: z.string().default(""), n: z.number().default(0) });
console.log("ชื่อ node ที่ชนกับฟิลด์:", findNameClashes(["plan", "log"], ["log", "n"]));
try {
  new StateGraph(State).addNode("log", () => ({})).addEdge(START, "log").addEdge("log", END);
} catch (error) {
  console.log("addNode ชื่อ log →", (error as Error).message);
}
