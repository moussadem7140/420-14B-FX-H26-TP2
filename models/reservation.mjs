import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    campsite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campsite",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guests: {
      type: Number,
      required: true,
      min: [0, "Le nombre de voyageurs doit être positif"],
    },
    vehicleLength: { type: Number },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Le prix total doit être positif"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Reservation", reservationSchema);
