import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { JsonPlusSerializer } from "@langchain/langgraph-checkpoint";
import type { SerializerProtocol } from "@langchain/langgraph-checkpoint";
import { todo } from "@src/todo";

// ตัวนำที่บอกว่าไบต์ชุดนี้เข้ารหัสแล้ว
export const MAGIC = Buffer.from("ENC1");
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function isEncrypted(data: Uint8Array | string): boolean {
  return typeof data !== "string" && Buffer.from(data).subarray(0, MAGIC.length).equals(MAGIC);
}

// metadata ของ checkpoint ({ source, step, parents }): PostgresSaver แปลงเป็น JSON ใน jsonb เพื่อกรองด้วย SQL จึงต้องคงเป็นข้อความธรรมดา
export function isCheckpointMetadata(data: unknown): boolean {
  return typeof data === "object" && data !== null && "source" in data && "step" in data && "parents" in data;
}

// กุญแจมาจาก hex 64 ตัวอักษร (= 32 ไบต์)
export function parseKey(hex: string): Buffer {
  // 👉 ข้อ 1: ถ้า hex ไม่ตรงรูป /^[0-9a-fA-F]{64}$/ ให้ throw new Error("กุญแจต้องเป็น hex 64 ตัวอักษร (32 ไบต์)")
  //          ไม่งั้นคืน Buffer.from(hex, "hex")
  return todo(1);
}

export function encryptBytes(key: Buffer, plain: Uint8Array): Uint8Array {
  // 👉 ข้อ 2: iv = randomBytes(12) (สุ่มใหม่ทุกครั้ง); cipher = createCipheriv("aes-256-gcm", key, iv)
  //          ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]); tag = cipher.getAuthTag()
  //          คืน Buffer.concat([MAGIC, iv, tag, ciphertext])
  return todo(2);
}

export function decryptBytes(key: Buffer, data: Uint8Array): Uint8Array {
  // 👉 ข้อ 3: แยก iv (ถัดจาก MAGIC 12 ไบต์), tag (16 ไบต์), ciphertext (ที่เหลือ) แล้วใช้ createDecipheriv("aes-256-gcm", key, iv)
  //          ใส่ setAuthTag(tag) แล้ว Buffer.concat([update(ciphertext), final()])
  //          ถ้า final() โยน error (กุญแจผิด/ข้อมูลถูกแก้) ให้ throw new Error("ถอดรหัสไม่ได้ (กุญแจผิดหรือข้อมูลถูกแก้)")
  return todo(3);
}

export class EncryptedSerde implements SerializerProtocol {
  constructor(
    private readonly key: Buffer,
    private readonly inner: SerializerProtocol = new JsonPlusSerializer(),
  ) {}

  async dumpsTyped(data: unknown): Promise<[string, Uint8Array]> {
    // 👉 ข้อ 4a: [type, bytes] = await this.inner.dumpsTyped(data)
    //          ถ้า isCheckpointMetadata(data) คืน [type, bytes] ตามเดิม (ไม่เข้ารหัส) ไม่งั้นคืน [type, encryptBytes(this.key, bytes)] (คงชนิดเดิมไว้)
    return todo("4a");
  }

  async loadsTyped(type: string, data: Uint8Array | string): Promise<unknown> {
    // 👉 ข้อ 4b: ถ้า isEncrypted(data) ให้ถอดรหัสด้วย decryptBytes (data เป็นไบต์แน่นอน) แล้วส่งให้ this.inner.loadsTyped(type, ผลที่ถอด)
    //          ถ้าไม่ใช่ (ข้อมูลเก่าที่ยังไม่เข้ารหัส) ส่ง data เดิมให้ this.inner.loadsTyped(type, data) ตรง ๆ
    return todo("4b");
  }
}
