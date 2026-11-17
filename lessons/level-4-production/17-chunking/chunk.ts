import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Chunk } from "@src/rag";
import { todo } from "@src/todo";

export const CHUNK_SIZE = 60;
export const CHUNK_OVERLAP = 10;

export function makeSplitter() {
  // 👉 ข้อ 1: คืน new RecursiveCharacterTextSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP })
  return todo(1);
}

// แปลงเอกสารทั้งชุดเป็น chunk โดยทุกชิ้นพก source เดิมของเอกสารไปด้วย
export async function toChunks(docs: Chunk[]): Promise<Chunk[]> {
  const splitter = makeSplitter();
  const out: Chunk[] = [];
  for (const doc of docs) {
    // 👉 ข้อ 2: pieces = await splitter.splitText(doc.text) แล้ว push { text: ชิ้น, source: doc.source } ของทุกชิ้นลง out
    todo(2);
  }
  return out;
}
