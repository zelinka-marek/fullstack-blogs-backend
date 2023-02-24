import express from "express";
import { Blog } from "../models/blog.js";

export const blogsRouter = express.Router();

blogsRouter.get("/", async (_request, response) => {
  const blogs = await Blog.find();

  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body);
  const savedBlog = await blog.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);

  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const data = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    {
      title: data.title,
      author: data.author,
      url: data.url,
      likes: data.likes,
    },
    { new: true, runValidators: true }
  );

  response.json(updatedBlog);
});
