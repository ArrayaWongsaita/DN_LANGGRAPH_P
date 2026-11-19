import { randomUUID } from "node:crypto";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseStore } from "@langchain/langgraph";
import { END, InMemoryStore, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";
import { todo } from "@src/todo";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { KeywordEmbeddings } from "@src/rag";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-03  (ส่วนสุดท้ายใช้ Postgres + embedding จริง: docker compose up -d --wait และ DATABASE_URL กับ GOOGLE_API_KEY ใน .env)
// ความจำระยะยาวที่ค้นด้วย "ความหมาย": store เก็บข้อความพร้อม embedding แล้ว store.search(query) ได้ของที่เกี่ยวที่สุดพร้อมคะแนน (ต่อจาก 3-10..3-12) แยกความจำต่อผู้ใช้ด้วย namespace
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(1);
}

function memoryNamespace(userId: string): string[] {
  // 👉 ข้อ 1: คืน [userId, "memories"] (แยกผู้ใช้ด้วย namespace)
  return todo(1);
}

async function remember(store: BaseStore, userId: string, text: string): Promise<string> {
  // 👉 ข้อ 2: key = randomUUID() แล้ว await store.put(memoryNamespace(userId), key, { text }) และคืน key
  return todo(2);
}

async function recall(store: BaseStore, userId: string, query: string, k = 3, minScore = 0.3): Promise<string[]> {
  // 👉 ข้อ 3: hits = await store.search(memoryNamespace(userId), { query, limit: k })
  //          เก็บเฉพาะที่ (score ?? 0) >= minScore แล้วคืน text ของแต่ละอัน (hit.value.text เป็น string)
  return todo(3);
}

const State = new StateSchema({
  userId: z.string().default(""),
  question: z.string().default(""),
  answer: z.string().default(""),
});

// (ให้ไว้แล้ว) บอทที่ระลึกความจำก่อนตอบ
function buildMemoryBot(llm: BaseChatModel, store: BaseStore) {
  return new StateGraph(State)
    .addNode("respond", async (state) => {
      const memories = await recall(store, state.userId, state.question);
      const context = memories.length > 0 ? `สิ่งที่รู้เกี่ยวกับผู้ใช้:\n- ${memories.join("\n- ")}\n` : "";
      const reply = await llm.invoke(`${context}คำถาม: ${state.question}`);
      return { answer: reply.text };
    })
    .addEdge(START, "respond")
    .addEdge("respond", END)
    .compile();
}

// ส่วนที่ 1: store ในหน่วยความจำ + embedding ปลอมที่นับคำ (ผลแน่นอน)
const makeStore = () => new InMemoryStore({ index: { dims: 6, embeddings: new KeywordEmbeddings(), fields: ["text"] } } as never);
const s1 = makeStore();
const key = await remember(s1, "u1", "ลืมรหัสผ่านต้องเปิด vpn");
const item = await s1.get(memoryNamespace("u1"), key);
const key2 = await remember(s1, "u1", "ก");

const s2 = makeStore();
await remember(s2, "u1", "คืนเงินได้ใน 7 วัน");
await remember(s2, "u1", "ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล");
const relevant = await recall(s2, "u1", "รหัสผ่าน", 2, 0.3);
const s3 = makeStore();
await remember(s3, "u1", "คืนเงินได้ใน 7 วัน");
const unrelated = await recall(s3, "u1", "วันนี้อากาศเป็นไง");
const s4 = makeStore();
for (const t of ["รหัสผ่าน ก", "รหัสผ่าน ข", "รหัสผ่าน ค"]) await remember(s4, "u1", t);
const limited = await recall(s4, "u1", "รหัสผ่าน", 2, 0.1);
const s5 = makeStore();
await remember(s5, "alice", "รหัสผ่านลับของ alice");
const leaked = await recall(s5, "bob", "รหัสผ่าน", 5, 0);

const s6 = makeStore();
await remember(s6, "alice", "ลืมรหัสผ่านต้องเปิด vpn");
await remember(s6, "bob", "คืนเงินได้ใน 7 วัน รหัสผ่านของ bob");
const fake = fakeToolLLM(["ตอบแล้ว"]);
const botOut = await buildMemoryBot(fake, s6).invoke({ userId: "alice", question: "ลืมรหัสผ่านทำไง" });

// ส่วนที่ 2: Postgres + embedding จริง ดูคะแนนจริงก่อนตั้งเกณฑ์ (embedding จริงให้คะแนนอยู่ในช่วงแคบ ไม่ใช่ 0-1 เต็มช่วง)
const real = PostgresStore.fromConnString(url, { index: { dims: embeddingDimensions(), embed: getEmbeddings(), fields: ["text"] } });
const userId = "demo-5-03";
const keys: string[] = [];
let allergy: string[] = [];
let train: string[] = [];
try {
  await real.setup();
  for (const text of ["ผู้ใช้แพ้ถั่วและอาหารทะเล", "ผู้ใช้ชอบเดินทางด้วยรถไฟ", "ผู้ใช้ทำงานเป็นพยาบาล"]) keys.push(await remember(real, userId, text));
  for (const query of ["แนะนำของหวานหน่อย", "จะไปเชียงใหม่ยังไงดี", "วันนี้หุ้นขึ้นหรือลง"]) {
    const hits = await real.search(memoryNamespace(userId), { query, limit: 3 });
    console.log(`\nถาม: ${query}`);
    for (const h of hits) console.log(" ", (h.score ?? 0).toFixed(3), h.value.text);
  }
  allergy = await recall(real, userId, "แนะนำของหวานหน่อย", 1, 0);
  train = await recall(real, userId, "จะไปเชียงใหม่ยังไงดี", 1, 0);
} finally {
  for (const k of keys) await real.delete(memoryNamespace(userId), k); // ลบข้อมูลทดลองทิ้ง
  await real.stop();
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("memoryNamespace: แยกตามผู้ใช้", JSON.stringify(memoryNamespace("u1")) === '["u1","memories"]' && JSON.stringify(memoryNamespace("u1")) !== JSON.stringify(memoryNamespace("u2")));
check("remember: เก็บ { text } ใต้ namespace ของผู้ใช้ และคืน key ที่ใช้ดึงกลับได้", JSON.stringify(item?.value) === '{"text":"ลืมรหัสผ่านต้องเปิด vpn"}' && key2 !== key);
check("recall: ได้ข้อความที่เกี่ยวที่สุดก่อน", JSON.stringify(relevant) === '["ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล"]', "กรอง score >= minScore");
check("recall: ตัดอันที่คะแนนต่ำกว่าเกณฑ์ ไม่ดึงของที่ไม่เกี่ยวมา", unrelated.length === 0);
check("recall: จำกัดจำนวนด้วย k", limited.length === 2);
check("ความเป็นส่วนตัว: ความจำของผู้ใช้หนึ่งไม่โผล่ให้อีกคน", leaked.length === 0, "ค้นใต้ namespace ของผู้ใช้เท่านั้น");
check("บอท: ความจำที่เกี่ยวถูกใส่ในพรอมต์ ส่วนของคนอื่นไม่ถูกใส่", botOut.answer === "ตอบแล้ว" && fake.calls[0][0].text.includes("ลืมรหัสผ่านต้องเปิด vpn") && !fake.calls[0][0].text.includes("bob"));
check("Postgres จริง: ถามหาของหวานเจอความจำเรื่องแพ้อาหาร ถามเที่ยวเจอเรื่องรถไฟ", allergy[0]?.includes("แพ้") === true && train[0]?.includes("รถไฟ") === true, "ตรวจ docker compose และ GOOGLE_API_KEY");
