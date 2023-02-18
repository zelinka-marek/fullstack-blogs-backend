import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { Blog } from "./models/blog.js";
import { MONGODB_URI, PORT } from "./utils/config.js";
import { logError, logInfo } from "./utils/logger.js";

logInfo("connecting to db");
mongoose
  .connect(MONGODB_URI)
  .then(() => logInfo("connected to db"))
  .catch((error) => logError("failed connecting to db", error.message));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/blogs", (_request, response) => {
  Blog.find({}).then((blogs) => response.json(blogs));
});

app.post("/api/blogs", (request, response) => {
  new Blog(request.body)
    .save()
    .then((result) => response.status(201).json(result));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
