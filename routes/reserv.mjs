import express from "express";
const router = express.Router();

// Controllers
import * as reservController from "../controllers/Reservations.mjs";
//Middlewares
import isAuth from "../middleware/PourAuthentification/isAuth.mjs";
import verifierReservation from "../middleware/PourReservations/verifierReservation.mjs";
// Routes
router.post(
  "/",
  isAuth,
  verifierReservation,
  reservController.createReservation,
);
router.get("/", isAuth, reservController.getReservations);
router.get("/:id", isAuth, reservController.getReservationById);
router.put(
  "/:id",
  isAuth,
  verifierReservation,
  reservController.updateReservation,
);
router.patch("/:id", isAuth, reservController.updateReservationStatus);
// router.delete("/:id", isAuth, reservController.deleteReservation);
export default router;
