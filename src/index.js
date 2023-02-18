import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { blogsRouter } from "./routes/blogs.js";
import { MONGODB_URI, PORT } from "./utils/config.js";
import { logError, logInfo } from "./utils/logger.js";
import {
  errorHandler,
  requestLogger,
  unknownEndpoint,
} from "./utils/middleware.js";

logInfo("connecting to db");
mongoose
  .connect(MONGODB_URI)
  .then(() => logInfo("connected to db"))
  .catch((error) => logError("failed connecting to db", error.message));

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api/blogs", blogsRouter);
app.use(errorHandler);
app.use(unknownEndpoint);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
