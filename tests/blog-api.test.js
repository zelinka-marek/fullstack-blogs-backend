import mongoose from "mongoose";
import supertest from "supertest";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { app } from "../src/app.js";
import { Blog } from "../src/models/blog.js";
import { getBlogsFromDatabase, initialBlogs } from "./blog-helpers.js";

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany();
  await Blog.insertMany(initialBlogs);
});

describe("when there are initially some blogs saved", () => {
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

  describe("addition of a new blog", () => {
    test("succeeds with valid data", async () => {
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

    test("succeeds with valid data, defaults likes to zero", async () => {
      const validBlog = {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
      };

      const response = await api.post("/api/blogs").send(validBlog);
      expect(response.status).toBe(201);
      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.body.likes).toBe(0);
    });

    test("fails with status 400 if title or url is missing", async () => {
      const invalidBlog = {
        author: "Michael Chan",
        likes: 0,
      };

      const response = await api.post("/api/blogs").send(invalidBlog);
      expect(response.status).toBe(400);

      const blogsAtEnd = await getBlogsFromDatabase();
      expect(blogsAtEnd).toHaveLength(initialBlogs.length);
    });
  });

  describe("deleting a specific blog", () => {
    test("succeeds with status 204 if id is valid", async () => {
      const blogsAtStart = await getBlogsFromDatabase();
      const blogToDelete = blogsAtStart[0];

      const response = await api.delete(`/api/blogs/${blogToDelete.id}`);
      expect(response.status).toBe(204);

      const blogsAtEnd = await getBlogsFromDatabase();
      expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1);

      const titles = blogsAtEnd.map((blog) => blog.title);
      expect(titles).not.toContainEqual(blogToDelete.title);
    });
  });

  describe("updating a specific blog", () => {
    test("succeeds with status 204 if id is valid", async () => {
      const blogsAtStart = await getBlogsFromDatabase();
      const blogToUpdate = blogsAtStart[0];
      const updatedBlog = {
        ...blogToUpdate,
        likes: 8,
      };

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog);
      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.body).toStrictEqual(updatedBlog);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
