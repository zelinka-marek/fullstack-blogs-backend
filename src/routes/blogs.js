import express from "express";
import { Blog } from "../models/blog.js";

export const blogsRouter = express.Router();

blogsRouter.get("/", async (_request, response, next) => {
  try {
    const blogs = await Blog.find();

    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.post("/", async (request, response, next) => {
  try {
    const blog = new Blog(request.body);
    const savedBlog = await blog.save();

    response.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:id", async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id);

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:id", async (request, response, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});
