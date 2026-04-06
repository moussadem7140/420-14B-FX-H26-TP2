import express from "express";
const router = express.Router();

// Controllers
import * as authController from "../controllers/Authentification.mjs";
//Middlewares
import { verifierUser } from "../middleware/PourAuthentification/verifierUser.mjs";
import { verifierLogin } from "../middleware/PourAuthentification/verifierLogin.mjs";
import isAuth from "../middleware/PourAuthentification/isAuth.mjs";
import verifierUserUpdate from "../middleware/PourAuthentification/verifierUserUpdate.mjs";
import verifyPassword from "../middleware/PourAuthentification/VerifierMdp.mjs";
// Routes
router.post("/register", verifierUser, authController.CreateUser);
router.post("/login", verifierLogin, authController.ConnectUser);
router.get("/profile", isAuth, authController.getProfile);
router.put(
  "/profile",
  isAuth,
  verifierUserUpdate,
  authController.updateProfile,
);
router.patch(
  "/password",
  isAuth,
  verifyPassword,
  authController.updatePassword,
);
export default router;
