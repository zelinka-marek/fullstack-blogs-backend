import express from "express";
import jwt from "jsonwebtoken";
import { Blog } from "../models/blog.js";
import { User } from "../models/user.js";
import { SECRET } from "../utils/config.js";

export const blogsRouter = express.Router();

blogsRouter.get("/", async (_request, response) => {
  const blogs = await Blog.find().populate("user", { username: 1, name: 1 });

  response.json(blogs);
});

function getToken(request) {
  const authorization = request.get("authorization");
  const token = authorization?.match(/^bearer (.+)$/i).at(1) ?? null;

  return token;
}

blogsRouter.post("/", async (request, response) => {
  const data = request.body;

  const decodedToken = jwt.verify(getToken(request), SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "invalid token" });
  }

  const user = await User.findById(decodedToken.id);

  const blog = await new Blog({
    title: data.title,
    author: data.author,
    url: data.url,
    user: user.id,
  }).save();

  user.blogs = user.blogs.concat(blog._id);
  await user.save();

  response.status(201).json(blog);
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
