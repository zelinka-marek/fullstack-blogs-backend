import express from "express";
import { Blog } from "../models/blog.js";

export const blogsRouter = express.Router();

blogsRouter.get("/", async (_request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body);
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});
