import { PostgresStore } from "@langchain/langgraph-checkpoint-postgres/store";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { memoryNamespace, recall, remember } from "./memory";

// ต้องเปิด Docker (docker compose up -d --wait), ตั้ง DATABASE_URL และ GOOGLE_API_KEY ใน .env
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
if (!process.env.DATABASE_URL) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(0);
}

const store = PostgresStore.fromConnString(process.env.DATABASE_URL, {
  index: { dims: embeddingDimensions(), embed: getEmbeddings(), fields: ["text"] },
});
const userId = "demo-5-03";
const keys: string[] = [];
try {
  await store.setup();
  for (const text of ["ผู้ใช้แพ้ถั่วและอาหารทะเล", "ผู้ใช้ชอบเดินทางด้วยรถไฟ", "ผู้ใช้ทำงานเป็นพยาบาล"]) keys.push(await remember(store, userId, text));
  // ดูคะแนนจริงก่อนตัดสินใจตั้งเกณฑ์ (embedding จริงให้คะแนนอยู่ในช่วงแคบ ไม่ใช่ 0-1 เต็มช่วง)
  for (const query of ["แนะนำของหวานหน่อย", "จะไปเชียงใหม่ยังไงดี", "วันนี้หุ้นขึ้นหรือลง"]) {
    const hits = await store.search(memoryNamespace(userId), { query, limit: 3 });
    console.log(`\nถาม: ${query}`);
    for (const h of hits) console.log(" ", (h.score ?? 0).toFixed(3), h.value.text);
  }
} finally {
  for (const key of keys) await store.delete(memoryNamespace(userId), key); // ลบข้อมูลทดลองทิ้ง
  await store.stop();
}
