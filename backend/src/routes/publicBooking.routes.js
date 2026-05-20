import { Router } from "express";
import {
  getPublicAvailableSlots,
  createPublicBooking,
  getPublicSpaces
} from "../controllers/publicBooking.controller.js";
import { requirePatientAuth } from "../middlewares/patientAuth.middleware.js";

const router = Router();

router.get("/spaces", getPublicSpaces);
router.get("/available-slots", getPublicAvailableSlots);
router.post("/book", requirePatientAuth, createPublicBooking);

export default router;