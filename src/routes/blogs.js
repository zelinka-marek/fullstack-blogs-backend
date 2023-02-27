import express from "express";
import { Blog } from "../models/blog.js";
import { userExtractor } from "../utils/middleware.js";

export const blogsRouter = express.Router();

blogsRouter.get("/", async (_request, response) => {
  const blogs = await Blog.find().populate("user", { username: 1, name: 1 });

  response.json(blogs);
});

blogsRouter.post("/", userExtractor, async (request, response) => {
  const { user, body } = request;

  const blog = await new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    user: user.id,
  }).save();

  user.blogs = user.blogs.concat(blog._id);
  await user.save();

  response.status(201).json(blog);
});

blogsRouter.delete("/:id", userExtractor, async (request, response) => {
  const { user, params } = request;

  const blog = await Blog.findById(params.id);
  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: "not your blog" });
  }

  await blog.delete();

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
