import { Router } from "express";
import {
  createMedicalRecordController,
  getMedicalRecordByIdController,
  getMedicalRecordByPatientIdController,
  getMedicalRecordsController,
  updateMedicalRecordController
} from "../controllers/medicalRecordController.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));

router.post("/", createMedicalRecordController);
router.get("/", getMedicalRecordsController);
router.get("/patient/:patientId", getMedicalRecordByPatientIdController);
router.get("/:id", getMedicalRecordByIdController);
router.put("/:id", updateMedicalRecordController);

export default router;
