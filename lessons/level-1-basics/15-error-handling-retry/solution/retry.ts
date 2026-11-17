import { errorStatus } from "../../../../src/errorInfo";

export interface RetryOptions {
  retries: number;
  delayMs: number;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ลองใหม่เมื่อล้มเหลว (retries = จำนวนครั้งที่ลองเพิ่ม) แต่ 401 (key ผิด) ลองกี่ครั้งก็ไม่หาย จึงไม่ retry
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (e) {
      if (errorStatus(e) === 401 || attempt >= opts.retries) throw e;
      attempt++;
      await sleep(opts.delayMs);
    }
  }
}
