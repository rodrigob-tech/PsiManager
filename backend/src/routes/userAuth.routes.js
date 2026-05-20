import { Router } from "express";
import {
  registerUser,
  loginUser,
  getAuthenticatedUserProfile
} from "../controllers/userAuth.controller.js";
import { requireUserAuth } from "../middlewares/userAuth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", requireUserAuth, getAuthenticatedUserProfile);

export default router;