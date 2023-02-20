import supertest from "supertest";
import { beforeEach, expect, test } from "vitest";
import { app } from "../src/app.js";
import { Blog } from "../src/models/blog.js";
import { getBlogsFromDatabase, initialBlogs } from "./blog-helpers.js";

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

test("a valid blog can be added", async () => {
  const validBlog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
  };
  const response = await api.post("/api/blogs").send(validBlog);
  expect(response.status).toBe(201);
  expect(response.header["content-type"]).toMatch(/application\/json/);

  const blogsAtEnd = await getBlogsFromDatabase();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  const titles = blogsAtEnd.map((blog) => blog.title);
  expect(titles).toContainEqual(validBlog.title);
});

test("if likes propery is missing, defaults to 0", async () => {
  const validBlog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
  };
  const response = await api.post("/api/blogs").send(validBlog);
  expect(response.body.likes).toBe(0);
});

test("blog without title or url is not added", async () => {
  const invalidBlog = {
    author: "Michael Chan",
    likes: 0,
  };
  const response = await api.post("/api/blogs").send(invalidBlog);
  expect(response.status).toBe(400);

  const blogsAtEnd = await getBlogsFromDatabase();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length);
});

test("deletion of a note", async () => {
  const blogsAtStart = await getBlogsFromDatabase();
  const blogToDelete = blogsAtStart[0];

  const response = await api.delete(`/api/blogs/${blogToDelete.id}`);
  expect(response.status).toBe(204);

  const blogsAtEnd = await getBlogsFromDatabase();
  expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1);

  const titles = blogsAtEnd.map((blog) => blog.title);
  expect(titles).not.toContainEqual(blogToDelete.title);
});
