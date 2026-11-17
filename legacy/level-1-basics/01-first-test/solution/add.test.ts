import { add } from "./add";

test("add(1, 2) ต้องได้ 3", () => {
  expect(add(1, 2)).toBe(3);
});

test("add(-1, 1) ต้องได้ 0", () => {
  expect(add(-1, 1)).toBe(0);
});

test("add(0, 0) ต้องได้ 0", () => {
  expect(add(0, 0)).toBe(0);
});
