import { Router } from "express";
import {
  startGoogleCalendarAuth,
  googleCalendarCallback
} from "../controllers/googleCalendar.controller.js";

const router = Router();

router.get("/auth", startGoogleCalendarAuth);
router.get("/callback", googleCalendarCallback);

export default router;