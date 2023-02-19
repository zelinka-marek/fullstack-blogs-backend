import { expect, test } from "vitest";
import { dummy } from "../src/utils/list.js";

test("dummy returns one", () => {
  const blogs = [];
  const result = dummy(blogs);

  expect(result).toBe(1);
});
