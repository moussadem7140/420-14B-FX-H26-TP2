import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
