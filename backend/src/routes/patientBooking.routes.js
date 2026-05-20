import { Router } from "express";
import { getMyAppointments,
         cancelMyAppointment
 } from "../controllers/patientBooking.controller.js";
import { requirePatientAuth } from "../middlewares/patientAuth.middleware.js";

const router = Router();

router.get("/me", requirePatientAuth, getMyAppointments);
router.patch("/:id/cancel", requirePatientAuth, cancelMyAppointment);
export default router;