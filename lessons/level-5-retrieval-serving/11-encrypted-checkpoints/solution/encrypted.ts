import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { JsonPlusSerializer } from "@langchain/langgraph-checkpoint";
import type { SerializerProtocol } from "@langchain/langgraph-checkpoint";

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

export function parseKey(hex: string): Buffer {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) throw new Error("กุญแจต้องเป็น hex 64 ตัวอักษร (32 ไบต์)");
  return Buffer.from(hex, "hex");
}

export function encryptBytes(key: Buffer, plain: Uint8Array): Uint8Array {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), ciphertext]);
}

export function decryptBytes(key: Buffer, data: Uint8Array): Uint8Array {
  const buf = Buffer.from(data);
  const iv = buf.subarray(MAGIC.length, MAGIC.length + IV_LENGTH);
  const tag = buf.subarray(MAGIC.length + IV_LENGTH, MAGIC.length + IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(MAGIC.length + IV_LENGTH + TAG_LENGTH);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error("ถอดรหัสไม่ได้ (กุญแจผิดหรือข้อมูลถูกแก้)");
  }
}

export class EncryptedSerde implements SerializerProtocol {
  constructor(
    private readonly key: Buffer,
    private readonly inner: SerializerProtocol = new JsonPlusSerializer(),
  ) {}

  async dumpsTyped(data: unknown): Promise<[string, Uint8Array]> {
    const [type, bytes] = await this.inner.dumpsTyped(data);
    return [type, isCheckpointMetadata(data) ? bytes : encryptBytes(this.key, bytes)];
  }

  async loadsTyped(type: string, data: Uint8Array | string): Promise<unknown> {
    if (isEncrypted(data)) return this.inner.loadsTyped(type, decryptBytes(this.key, data as Uint8Array));
    return this.inner.loadsTyped(type, data);
  }
}
