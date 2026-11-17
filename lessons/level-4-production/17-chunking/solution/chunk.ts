import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Chunk } from "@src/rag";

export const CHUNK_SIZE = 60;
export const CHUNK_OVERLAP = 10;

export function makeSplitter() {
  return new RecursiveCharacterTextSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP });
}

export async function toChunks(docs: Chunk[]): Promise<Chunk[]> {
  const splitter = makeSplitter();
  const out: Chunk[] = [];
  for (const doc of docs) {
    const pieces = await splitter.splitText(doc.text);
    for (const text of pieces) out.push({ text, source: doc.source });
  }
  return out;
}
