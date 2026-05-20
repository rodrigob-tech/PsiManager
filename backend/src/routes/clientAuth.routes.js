import { Router } from "express";
import {
  registerClient,
  loginClient,
  getAuthenticatedClientProfile
} from "../controllers/clientAuth.controller.js";
import { requireClientAuth } from "../middlewares/clientAuth.middleware.js";

const router = Router();

router.post("/register", registerClient);
router.post("/login", loginClient);
router.get("/me", requireClientAuth, getAuthenticatedClientProfile);

export default router;