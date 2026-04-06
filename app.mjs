import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
// Routes
import dbRoutes from "./routes/db.mjs";
app.use("/api/db", dbRoutes);

import authRoutes from "./routes/auth.mjs";
app.use("/api/auth", authRoutes);

import campRoutes from "./routes/camp.mjs";
app.use("/api/campsites", campRoutes);

import reservRoutes from "./routes/reserv.mjs";
app.use("/api/reservations", reservRoutes);

// Gestion erreur 404, ce middleware doit être le dernier
import { get404, getErrors } from "./controllers/errorController.mjs";
app.use("*", get404);

// Gestion des erreurs
app.use(getErrors);

// Connect to MongoDB

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
