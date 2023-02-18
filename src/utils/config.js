export const { PORT, MONGODB_URI } = process.env;

if (!PORT) {
  throw new Error("PORT must be set");
}

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be set");
}
