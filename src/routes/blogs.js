import express from "express";
import { Blog } from "../models/blog.js";

export const blogsRouter = express.Router();

blogsRouter.get("/", (_request, response) => {
  Blog.find({}).then((blogs) => response.json(blogs));
});

blogsRouter.post("/", (request, response) => {
  new Blog(request.body)
    .save()
    .then((result) => response.status(201).json(result));
});
