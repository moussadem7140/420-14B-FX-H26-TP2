import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "Le prénom est requis"] },
    lastName: {
      type: String,
      required: [true, "Le nom de famille est requis"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: (props) => `${props.value} n'est pas un email valide!`,
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return v == null || /^\d{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} n'est pas un numéro de téléphone valide!`,
      },
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      select: false,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
