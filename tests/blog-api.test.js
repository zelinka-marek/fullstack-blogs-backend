import supertest from "supertest";
import { beforeEach, expect, test } from "vitest";
import { app } from "../src/app.js";
import { Blog } from "../src/models/blog.js";
import { initialBlogs } from "./blog-helpers.js";

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany();
  await Blog.insertMany(initialBlogs);
});

test("blogs are returned as json", async () => {
  const response = await api.get("/api/blogs");
  expect(response.status).toBe(200);
  expect(response.header["content-type"]).toMatch(/application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(initialBlogs.length);
});

test("blogs have a unique identifier property named id", async () => {
  const response = await api.get("/api/blogs");
  const ids = response.body.map((note) => note.id);
  for (const id of ids) {
    expect(id).toBeDefined();
  }
});
