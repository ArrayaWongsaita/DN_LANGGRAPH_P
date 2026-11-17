import { example } from "./topic";

test("ข้อ 1", () => {
  expect(example(1, 2)).toBe(3);
});

test("ข้อ 2", () => {
  expect(example(-1, 1)).toBe(0);
});
