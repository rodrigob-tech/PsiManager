import { Router } from "express";
import {
  createMedicalRecord,
  getMedicalRecordById,
  getMedicalRecordByPatientId,
  getMedicalRecords,
  updateMedicalRecord
} from "../controllers/medicalRecord.controller.js";
import authInternal from "../middlewares/authInternal.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();
router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));




router.post("/", createMedicalRecord);
router.get("/", getMedicalRecords);
router.get("/patient/:patientId", getMedicalRecordByPatientId);
router.get("/:id", getMedicalRecordById);
router.put("/:id", updateMedicalRecord);

export default router;
