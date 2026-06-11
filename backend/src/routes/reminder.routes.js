import { Router } from "express";

import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { sendPatientReminderEmail } from "../controllers/reminder.controller.js";

const router = Router();

router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));

router.post("/patients/:patientId/email", sendPatientReminderEmail);

export default router;