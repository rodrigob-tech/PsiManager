import { Router } from "express";

import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

import {
  startGoogleCalendarAuth,
  googleCalendarCallback,
  getGoogleCalendarStatus,
} from "../controllers/googleCalendar.controller.js";

const router = Router();

router.get("/callback", googleCalendarCallback);

router.get(
  "/auth",
  authInternal,
  authorizeRoles("ADMIN", "PSYCHOLOGIST"),
  startGoogleCalendarAuth
);

router.get(
  "/status",
  authInternal,
  authorizeRoles("ADMIN", "PSYCHOLOGIST"),
  getGoogleCalendarStatus
);

export default router;