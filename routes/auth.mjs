import express from "express";
const router = express.Router();

// Controllers
import * as authController from "../controllers/Authentification.mjs";
//Middlewares
import { verifierUser } from "../middleware/verifierUser.mjs";
import { verifierLogin } from "../middleware/verifierLogin.mjs";
// Routes
router.post("/register", verifierUser, authController.CreateUser);
router.post("/login", verifierLogin, authController.ConnectUser);

export default router;
