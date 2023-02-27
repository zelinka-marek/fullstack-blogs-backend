import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import supertest from "supertest";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { app } from "../src/app.js";
import { Blog } from "../src/models/blog.js";
import { User } from "../src/models/user.js";
import { SECRET } from "../src/utils/config.js";
import {
  getBlogsFromDatabase,
  getUsersFromDatabase,
  initialBlogs,
  initialUser,
} from "./blog-helpers.js";

const api = supertest(app);

describe("when there are initially some blogs saved", () => {
  let token;

  beforeEach(async () => {
    await User.deleteMany();
    const passwordHash = await bcrypt.hash(initialUser.password, 10);
    const user = await new User({
      username: initialUser.username,
      passwordHash,
    }).save();

    const tokenPayload = { usernmae: user.name, id: user._id };
    token = jwt.sign(tokenPayload, SECRET);

    await Blog.deleteMany();
    for (const blog of initialBlogs) {
      await new Blog({ ...blog, user: user._id }).save();
    }
  });

  test("blogs are returned as json", async () => {
    const response = await api.get("/api/blogs");
    expect(response.status).toBe(200);
    expect(response.get("content-type")).toMatch(/application\/json/);
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

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(validBlog);
      expect(response.status).toBe(201);
      expect(response.get("content-type")).toMatch(/application\/json/);

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

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(validBlog);
      expect(response.status).toBe(201);
      expect(response.get("content-type")).toMatch(/application\/json/);
      expect(response.body.likes).toBe(0);
    });

    test("fails with status 400 if title or url is missing", async () => {
      const invalidBlog = {
        author: "Michael Chan",
        likes: 0,
      };

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidBlog);
      expect(response.status).toBe(400);

      const blogsAtEnd = await getBlogsFromDatabase();
      expect(blogsAtEnd).toHaveLength(initialBlogs.length);
    });

    test("fails with status 401 if auth token is not provided", async () => {
      const validBlog = {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
      };

      const response = await api.post("/api/blogs").send(validBlog);
      expect(response.status).toBe(401);

      const blogsAtEnd = await getBlogsFromDatabase();
      expect(blogsAtEnd).toHaveLength(initialBlogs.length);
    });
  });

  describe("deleting a specific blog", () => {
    test("succeeds with status 204 if id is valid", async () => {
      const blogsAtStart = await getBlogsFromDatabase();
      const blogToDelete = blogsAtStart[0];

      const response = await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${token}`);
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

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ likes: 8 });
      expect(response.status).toBe(200);
      expect(response.get("content-type")).toMatch(/application\/json/);
      expect(response.body.likes).toBe(blogToUpdate.likes + 1);

      const blogsAtEnd = await getBlogsFromDatabase();
      expect(blogsAtEnd.length).toBe(blogsAtStart.length);

      const updatedBlog = blogsAtEnd[0];
      expect(updatedBlog.likes).toBe(blogToUpdate.likes + 1);
    });
  });
});

describe("when there is initialy one user saved", () => {
  beforeEach(async () => {
    await User.deleteMany();

    const passwordHash = await bcrypt.hash(initialUser.password, 10);
    await new User({ username: initialUser.username, passwordHash }).save();
  });

  test("users is returned as json", async () => {
    const response = await api.get("/api/users");
    expect(response.status).toBe(200);
    expect(response.get("content-type")).toMatch(/application\/json/);
  });

  test("saved user is returned", async () => {
    const response = await api.get("/api/users");
    expect(response.body).toHaveLength(1);
  });

  describe("addition of a new user", () => {
    test("succeeds with valid data", async () => {
      const usersAtStart = await getUsersFromDatabase();

      const validUser = {
        username: "m_chan",
        password: "123456",
      };

      const response = await api.post("/api/users").send(validUser);
      expect(response.status).toBe(201);
      expect(response.get("content-type")).toMatch(/application\/json/);

      const usersAtEnd = await getUsersFromDatabase();
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);
      expect(usernames).toContain(validUser.username);
    });

    test("fails with status 400 if username is taken", async () => {
      const usersAtStart = await getUsersFromDatabase();

      const invalidUser = {
        username: "admin",
        password: "salainen",
      };

      const response = await api.post("/api/users").send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.get("content-type")).toMatch(/application\/json/);
      expect(response.body.errors.username).toMatch(/username must be unique/i);

      const usersAtEnd = await getUsersFromDatabase();
      expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
