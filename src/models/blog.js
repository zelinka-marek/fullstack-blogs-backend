import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: [true, "Title is required"] },
  author: { type: String, trim: true, required: [true, "Author is required"] },
  url: {
    type: String,
    trim: true,
    required: [true, "Url is required"],
    validate: {
      validator: (value) =>
        value.includes("http://") || value.includes("https://"),
      message: (props) => `${props.value} is not a valid url!`,
    },
  },
  likes: { type: Number, default: 0 },
});

export const Blog = mongoose.model("Blog", blogSchema);
