import { CHUNK_OVERLAP, CHUNK_SIZE, toChunks } from "./chunk";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้ข้อความอังกฤษเพราะมีช่องว่างให้ตัดเห็นชัด
const long = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega";

test("เอกสารสั้น: ได้ชิ้นเดียวและพก source", async () => {
  const out = await toChunks([{ source: "a.md", text: "สั้น ๆ" }]);
  expect(out).toEqual([{ source: "a.md", text: "สั้น ๆ" }]);
});

test("เอกสารยาว: แบ่งเป็นหลายชิ้น แต่ละชิ้นไม่เกิน chunkSize", async () => {
  const out = await toChunks([{ source: "g.md", text: long }]);
  expect(out.length).toBeGreaterThan(1);
  expect(out.every((c) => c.text.length <= CHUNK_SIZE)).toBe(true);
});

test("ทุกชิ้นพก source ของเอกสารตัวเอง (หลายเอกสารไม่ปนกัน)", async () => {
  const out = await toChunks([
    { source: "one.md", text: long },
    { source: "two.md", text: "short" },
  ]);
  expect(out.filter((c) => c.source === "one.md").length).toBeGreaterThan(1);
  expect(out.filter((c) => c.source === "two.md")).toEqual([{ source: "two.md", text: "short" }]);
});

test("ชิ้นติดกันซ้อนกัน (overlap) เพื่อไม่ให้ประโยคขาดตรงรอยต่อ และไม่มีเนื้อหาหาย", async () => {
  const out = await toChunks([{ source: "g.md", text: long }]);
  const words = long.split(" ");
  const joined = out.map((c) => c.text).join(" ");
  expect(words.every((w) => joined.includes(w))).toBe(true);
  const tailOfFirst = out[0].text.split(" ").pop()!;
  expect(out[1].text.includes(tailOfFirst)).toBe(CHUNK_OVERLAP > 0);
});
