import mongoose from "mongoose";

const campsiteSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Le nom du camping est requis"] },
    location: {
      type: String,
      required: [true, "L'emplacement du camping est requis"],
    },
    description: { type: String },
    type: {
      type: String,
      enum: ["tente", "rv", "chalet", "glamping", "arrière-pays", "autre"],
      required: [true, "Le type de camping est requis"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Le prix par nuit est requis"],
      min: [0, "Le prix par nuit doit être positif"],
    },
    capacity: {
      type: Number,
      required: [true, "La capacité est requise"],
      min: [0, "La capacité doit être positive"],
    },
    maxVehicleLength: {
      type: Number,
      min: [0, "La longueur doit être positive"],
      required: function () {
        return this.type === "rv";
      },
    }, // in meters, required for RV sites
    amenities: {
      type: [String],
      enum: [
        "électricité",
        "eau",
        "égout",
        "feu de camp",
        "table de pique-nique",
        "abri",
        "wifi",
        "douche",
        "toilettes",
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Campsite", campsiteSchema);
