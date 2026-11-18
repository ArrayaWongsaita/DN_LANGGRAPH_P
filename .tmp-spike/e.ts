import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { JsonPlusSerializer } from "@langchain/langgraph-checkpoint";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
const key = randomBytes(32);
const inner = new JsonPlusSerializer();
const MAGIC = Buffer.from("ENC1");
const serde = {
  async dumpsTyped(d: any) {
    const [t, b] = await inner.dumpsTyped(d);
    const iv = randomBytes(12); const c = createCipheriv("aes-256-gcm", key, iv);
    const enc = Buffer.concat([c.update(b), c.final()]);
    return [t, Buffer.concat([MAGIC, iv, c.getAuthTag(), enc])] as [string, Uint8Array];
  },
  async loadsTyped(t: string, d: Uint8Array | string) {
    if (typeof d === "string" || !Buffer.from(d).subarray(0, 4).equals(MAGIC)) return inner.loadsTyped(t, d);
    const buf = Buffer.from(d); const dc = createDecipheriv("aes-256-gcm", key, buf.subarray(4, 16)); dc.setAuthTag(buf.subarray(16, 32));
    return inner.loadsTyped(t, Buffer.concat([dc.update(buf.subarray(32)), dc.final()]));
  },
};
const saver = new MemorySaver(serde as any);
const S = new StateSchema({ secret: z.string().default("") });
const g = new StateGraph(S).addNode("a", () => ({ secret: "รหัสลับ-999" })).addEdge(START, "a").addEdge("a", END).compile({ checkpointer: saver });
const cfg = { configurable: { thread_id: "t" } };
console.log(await g.invoke({}, cfg));
console.log((await g.getState(cfg)).values);
function hasText(o: any, needle: string): boolean {
  if (o instanceof Uint8Array) return Buffer.from(o).includes(needle);
  if (typeof o === "string") return o.includes(needle);
  if (o && typeof o === "object") return Object.values(o).some((v) => hasText(v, needle));
  return false;
}
console.log("encrypted saver leaks?", hasText((saver as any).storage, "999"), hasText((saver as any).blobs, "999"));
const plain = new MemorySaver();
const g2 = new StateGraph(S).addNode("a", () => ({ secret: "รหัสลับ-999" })).addEdge(START, "a").addEdge("a", END).compile({ checkpointer: plain });
await g2.invoke({}, cfg);
console.log("control leaks?", hasText((plain as any).storage, "999"), hasText((plain as any).blobs, "999"));
console.log(Object.keys(plain as any));
