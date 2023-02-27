import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { SECRET } from "./config.js";
import { logError, logInfo } from "./logger.js";

export function requestLogger(request, _response, next) {
  logInfo("Method:", request.method);
  logInfo("Path:", request.path);
  logInfo("Body:", request.body);
  logInfo("---");

  next();
}

export function unknownEndpoint(_request, response) {
  response.status(404).end();
}

export function errorHandler(error, _request, response, next) {
  logError(error);

  if (error.name === "CastError") {
    return response.status(400).json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    const errors = {};

    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });

    return response.status(400).json({ errors });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: error.message });
  }

  next(error);
}

export function tokenExtractor(request, _response, next) {
  const authorization = request.get("authorization");
  const token = authorization?.match(/^bearer (.+)$/i).at(1) ?? null;

  request.token = token;

  next();
}

export async function userExtractor(request, response, next) {
  const decodedToken = jwt.verify(request.token, SECRET);
  if (!decodedToken?.id) {
    return response.status(401).json({ error: "invalid token" });
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(401).json({ error: "not authenticated" });
  }

  request.user = user;

  next();
}
