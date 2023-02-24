import bcrypt from "bcryptjs";
import express from "express";
import { User } from "../models/user.js";

export const usersRouter = express.Router();

usersRouter.get("/", async (_request, response) => {
  const users = await User.find();

  response.json(users);
});

usersRouter.post("/", async (request, response, next) => {
  try {
    const data = request.body;

    if (!data.password) {
      return response
        .status(400)
        .json({ errors: { password: "Password is required" } });
    } else if (data.password.trim().length < 3) {
      return response.status(400).json({
        errors: { password: "Password must be at least 3 characters long" },
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await new User({
      username: data.username,
      name: data.name,
      passwordHash,
    }).save();

    response.status(201).json(user);
  } catch (error) {
    next(error);
  }
});
