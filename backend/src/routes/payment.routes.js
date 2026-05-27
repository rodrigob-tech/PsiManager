import express from "express";
import {
  getPayments,
  getPaymentById,
  getPaymentByAppointmentId,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.get("/", getPayments);
router.get("/appointment/:appointmentId", getPaymentByAppointmentId);
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;