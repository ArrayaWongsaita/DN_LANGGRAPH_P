import { buildParallelGraph, buildSequentialGraph } from "./reducers";

// รัน: pnpm lesson 16  (ไม่ใช้ LLM)
console.log("เรียงกัน:", await buildSequentialGraph().invoke({}));
console.log("ขนานกัน: ", await buildParallelGraph().invoke({}));
