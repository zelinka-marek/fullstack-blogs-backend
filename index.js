import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const PORT = process.env.PORT;
const mongoUrl = process.env.MONGODB_URI;

mongoose.connect(mongoUrl);

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

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
