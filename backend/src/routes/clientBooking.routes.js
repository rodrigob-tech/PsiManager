import { Router } from "express";
import { getMyAppointments,
         cancelMyAppointment
 } from "../controllers/clientBooking.controller.js";
import { requireClientAuth } from "../middlewares/clientAuth.middleware.js";

const router = Router();

router.get("/me", requireClientAuth, getMyAppointments);
router.patch("/:id/cancel", requireClientAuth, cancelMyAppointment);
export default router;