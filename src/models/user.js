import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    minLength: [3, "Username must be at least 3 characters long"],
    trim: true,
    unique: true,
  },
  name: String,
  passwordHash: String,
});

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

userSchema.plugin(uniqueValidator, { message: "{PATH} must be unique" });

export const User = mongoose.model("User", userSchema);
