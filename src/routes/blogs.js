import express from "express";
import { Blog } from "../models/blog.js";

export const blogsRouter = express.Router();

app.get("/api/blogs", (_request, response) => {
  Blog.find({}).then((blogs) => response.json(blogs));
});

app.post("/api/blogs", (request, response) => {
  new Blog(request.body)
    .save()
    .then((result) => response.status(201).json(result));
});
