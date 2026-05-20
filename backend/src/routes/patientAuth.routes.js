import { Router } from "express";
import {
  registerPatient,
  loginPatient,
  getAuthenticatedPatientProfile
} from "../controllers/patientAuth.controller.js";
import { requirePatientAuth } from "../middlewares/patientAuth.middleware.js";

const router = Router();

router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.get("/me", requirePatientAuth, getAuthenticatedPatientProfile);

export default router;
