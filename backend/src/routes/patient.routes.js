import { Router } from "express";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from "../controllers/patient.controller.js";
import authInternal from "../middlewares/authInternal.js";


import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = Router();
router.use(authInternal);
router.use(authorizeRoles("ADMIN", "PSYCHOLOGIST"));
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.patch("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;
