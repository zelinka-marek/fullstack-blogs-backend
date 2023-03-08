import express from "express";
import { User } from "../models/user.js";
import { Blog } from "../models/blog.js";

export const testRouter = express.Router();

testRouter.post("/reset", async (_request, response) => {
  await User.deleteMany();
  await Blog.deleteMany();

  response.status(204).end();
});
