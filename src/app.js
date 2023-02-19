import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { blogsRouter } from "./routes/blogs.js";
import { MONGODB_URI } from "./utils/config.js";
import { logError, logInfo } from "./utils/logger.js";
import {
  errorHandler,
  requestLogger,
  unknownEndpoint,
} from "./utils/middleware.js";

mongoose.set("strictQuery", false);
mongoose.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

logInfo("connecting to db", MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => logInfo("connected to db"))
  .catch((error) => logError("error connecting to db:", error.message));

export const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api/blogs", blogsRouter);
app.use(unknownEndpoint);
app.use(errorHandler);