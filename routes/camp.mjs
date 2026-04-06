import express from "express";
const router = express.Router();

// Controllers
import * as campController from "../controllers/campsites.mjs";
//Middlewares
import isAuth from "../middleware/PourAuthentification/isAuth.mjs";
import verifierCampsite from "../middleware/PourCampsites/verifierCampsite.mjs";
import IsNotReserved from "../middleware/PourCampsites/IsNotReserved.mjs";
// Routes
router.post("/", isAuth, verifierCampsite, campController.createCampsite);
router.get("/", campController.getAllCampsites);
router.get("/available", campController.getAvailableCampsites);
router.get("/:id", campController.getCampsiteById);
router.put("/:id", isAuth, verifierCampsite, campController.updateCampsite);
router.delete("/:id", isAuth, IsNotReserved, campController.deleteCampsite);
export default router;
