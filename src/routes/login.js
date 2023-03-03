import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { SECRET } from "../utils/config.js";

export const loginRouter = express.Router();

loginRouter.post("/", async (request, response) => {
  const data = request.body;

  const user = await User.findOne({ username: data.username });
  const isPasswordCorrect = !user
    ? false
    : await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordCorrect) {
    return response.status(401).json({ error: "invalid username or password" });
  }

  const tokenPayload = { username: user.username, id: user._id };
  const token = jwt.sign(tokenPayload, SECRET);

  response
    .status(201)
    .json({ token, username: user.username, name: user.name });
});
