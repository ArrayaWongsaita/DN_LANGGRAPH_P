import { type BlobRow, type Db, SQL, findOrphanBlobs, planPrune, pruneThread, staleThreads } from "./housekeeping";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ฐานข้อมูลปลอมในหน่วยความจำที่ทำงานตาม SQL ใน SQL.* และจดคำสั่งทั้งหมด
type Cp = { ns: string; id: string; channel_versions: Record<string, string> };
class FakeDb implements Db {
  log: string[] = [];
  failOn: string | null = null;
  constructor(
    public checkpoints: Cp[],
    public blobs: BlobRow[],
    public writes: string[],
  ) {}
  async query(sql: string, params: any[] = []) {
    const name = Object.entries(SQL).find(([, v]) => v === sql)?.[0] ?? sql;
    this.log.push(name);
    if (this.failOn === name) throw new Error(`ล้มที่ ${name}`);
    if (sql === SQL.listCheckpoints) {
      return { rows: [...this.checkpoints].sort((a, b) => (a.id < b.id ? 1 : -1)) };
    }
    if (sql === SQL.listBlobs) return { rows: [...this.blobs] };
    if (sql === SQL.deleteWrites) this.writes = this.writes.filter((w) => !params[1].includes(w));
    if (sql === SQL.deleteCheckpoints) this.checkpoints = this.checkpoints.filter((c) => !params[1].includes(c.id));
    if (sql === SQL.deleteBlobs) {
      const [, ns, ch, ver] = params as [string, string[], string[], string[]];
      this.blobs = this.blobs.filter((b) => !ns.some((n, i) => n === b.ns && ch[i] === b.channel && ver[i] === b.version));
    }
    return { rows: [] };
  }
}

// 5 checkpoint (id เรียงตามเวลา) channel "count" เปลี่ยนทุกขั้น ส่วน "name" เปลี่ยนแค่ขั้นแรก (blob ใช้ร่วม)
const fixture = () =>
  new FakeDb(
    [1, 2, 3, 4, 5].map((n) => ({ ns: "", id: `cp${n}`, channel_versions: { count: `v${n}`, name: "n1" } })),
    [
      ...[1, 2, 3, 4, 5].map((n) => ({ ns: "", channel: "count", version: `v${n}` })),
      { ns: "", channel: "name", version: "n1" },
    ],
    ["cp1", "cp2", "cp5"],
  );

test("planPrune: เก็บใหม่สุด keep อันต่อ namespace ลบที่เหลือ (รับลำดับอะไรก็ได้)", () => {
  const rows = ["cp3", "cp1", "cp5", "cp2", "cp4"].map((id) => ({ ns: "", id }));
  expect(planPrune(rows, 2).map((r) => r.id).sort()).toEqual(["cp1", "cp2", "cp3"]);
  expect(planPrune(rows, 5)).toEqual([]);
  expect(planPrune(rows, 99)).toEqual([]);
});

test("planPrune: แต่ละ namespace นับแยกกัน (subgraph)", () => {
  const rows = [
    { ns: "", id: "a1" },
    { ns: "", id: "a2" },
    { ns: "sub:1", id: "b1" },
    { ns: "sub:1", id: "b2" },
    { ns: "sub:1", id: "b3" },
  ];
  expect(planPrune(rows, 1).map((r) => r.id).sort()).toEqual(["a1", "b1", "b2"]);
});

test("planPrune: keep < 1 ไม่อนุญาต (ไม่งั้นลบหมดทั้ง thread)", () => {
  expect(() => planPrune([{ ns: "", id: "a" }], 0)).toThrow("ต้องเก็บอย่างน้อย 1 checkpoint");
});

test("findOrphanBlobs: blob ที่ยังถูกอ้างโดย checkpoint ที่เหลือ (แม้ใช้ร่วม) ห้ามถูกนับเป็นกำพร้า", () => {
  const blobs = [
    { ns: "", channel: "count", version: "v1" },
    { ns: "", channel: "count", version: "v5" },
    { ns: "", channel: "name", version: "n1" },
    { ns: "sub", channel: "name", version: "n1" },
  ];
  const kept = [{ ns: "", channel_versions: { count: "v5", name: "n1" } }];
  expect(findOrphanBlobs(blobs, kept)).toEqual([
    { ns: "", channel: "count", version: "v1" },
    { ns: "sub", channel: "name", version: "n1" },
  ]);
});

test("findOrphanBlobs: เวอร์ชันเป็นตัวเลขก็เทียบได้ (เทียบเป็นสตริง)", () => {
  expect(findOrphanBlobs([{ ns: "", channel: "c", version: "3" }], [{ ns: "", channel_versions: { c: 3 } }])).toEqual([]);
});

test("pruneThread: ลบ checkpoint เก่า, writes ของมัน และ blob กำพร้า แต่เก็บ blob ที่ใช้ร่วม", async () => {
  const db = fixture();
  expect(await pruneThread(db, "t1", 2)).toEqual({ checkpoints: 3, blobs: 3 });
  expect(db.checkpoints.map((c) => c.id).sort()).toEqual(["cp4", "cp5"]);
  expect(db.writes).toEqual(["cp5"]);
  expect(db.blobs.map((b) => `${b.channel}:${b.version}`).sort()).toEqual(["count:v4", "count:v5", "name:n1"]);
});

test("pruneThread: อยู่ในธุรกรรม BEGIN … COMMIT เรียงถูก", async () => {
  const db = fixture();
  await pruneThread(db, "t1", 2);
  expect(db.log[0]).toBe("BEGIN");
  expect(db.log.at(-1)).toBe("COMMIT");
  expect(db.log).not.toContain("ROLLBACK");
  expect(db.log.indexOf("deleteWrites")).toBeLessThan(db.log.indexOf("deleteCheckpoints"));
});

test("pruneThread: ล้มกลางทาง → ROLLBACK และไม่ COMMIT แล้วโยน error เดิม", async () => {
  const db = fixture();
  db.failOn = "deleteBlobs";
  await expect(pruneThread(db, "t1", 2)).rejects.toThrow("ล้มที่ deleteBlobs");
  expect(db.log.at(-1)).toBe("ROLLBACK");
  expect(db.log).not.toContain("COMMIT");
});

test("pruneThread: ไม่มีอะไรต้องลบ → ไม่ลบอะไร และปิดธุรกรรมให้เรียบร้อย", async () => {
  const db = fixture();
  expect(await pruneThread(db, "t1", 10)).toEqual({ checkpoints: 0, blobs: 0 });
  expect(db.log.filter((l) => l.startsWith("delete"))).toEqual([]);
  expect(db.log.at(-1)).toBe("COMMIT");
});

test("pruneThread: keep < 1 ไม่แตะฐานข้อมูลเลย", async () => {
  const db = fixture();
  await expect(pruneThread(db, "t1", 0)).rejects.toThrow("ต้องเก็บอย่างน้อย 1");
  expect(db.log).toEqual([]);
  expect(db.checkpoints).toHaveLength(5);
});

test("staleThreads: เก่ากว่าเกณฑ์จริง ๆ เท่านั้น (เท่ากับเกณฑ์ไม่นับ)", () => {
  const now = new Date("2026-06-30T00:00:00Z");
  const day = 24 * 60 * 60 * 1000;
  const threads = [
    { threadId: "old", lastActivity: new Date(now.getTime() - 31 * day) },
    { threadId: "edge", lastActivity: new Date(now.getTime() - 30 * day) },
    { threadId: "new", lastActivity: new Date(now.getTime() - 1 * day) },
    { threadId: "old2", lastActivity: new Date(now.getTime() - 400 * day) },
  ];
  expect(staleThreads(threads, now, 30)).toEqual(["old", "old2"]);
});
