import express from "express";

import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

import { generatePaymentReceipt, generatePatientFile, generateFinancialReport } from "../controllers/document.controller.js";

const router = express.Router();

router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));

router.get("/payments/:paymentId/receipt", generatePaymentReceipt);
router.get("/patients/:patientId/file", generatePatientFile);
router.get("/reports/financial", generateFinancialReport);
export default router;