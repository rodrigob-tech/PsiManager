import { Router } from "express";
import {
  getPublicAvailableSlots,
  createPublicBooking,
  getPublicSpaces
} from "../controllers/publicBooking.controller.js";
import { requireClientAuth } from "../middlewares/clientAuth.middleware.js";

const router = Router();

router.get("/spaces", getPublicSpaces);
router.get("/available-slots", getPublicAvailableSlots);
router.post("/book", requireClientAuth, createPublicBooking);

export default router;